import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { firebaseAuthClient } from "../config/firebase";
import { apiClient } from "../config/api";

export type AppRole = "employee" | "hr" | "admin";

type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: AppRole | null; // null = needs role selection
};

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: AppRole) => void;
  selectRole: (role: AppRole) => Promise<void>;
  logout: () => Promise<void>;
  isDemo: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthClient, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to fetch the user's profile from the backend
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/api/employees/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const body = await res.json();
            const profile = body.data;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: profile?.displayName ?? firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
              role: profile?.role ?? null,
            });
          } else {
            // User exists in Firebase but not in our Firestore — needs role selection
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
              role: null,
            });
          }
        } catch {
          // Backend unavailable — still let the user proceed to role selection
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
            role: null,
          });
        }
      } else if (!isDemo) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(firebaseAuthClient, email, password);
    // onAuthStateChanged will handle the rest
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseAuthClient, provider);
  };

  const loginAsDemo = (role: AppRole) => {
    setIsDemo(true);
    setUser({
      uid: role === "hr" ? "demo-hr-001" : "demo-employee-001",
      email: role === "hr" ? "james.robertson@company.com" : "sarah.mitchell@company.com",
      displayName: role === "hr" ? "James Robertson" : "Sarah Mitchell",
      role,
    });
    setLoading(false);
  };

  const selectRole = async (role: AppRole) => {
    if (!user) return;

    // Persist the role to the backend
    try {
      await apiClient("/api/auth/set-role", {
        method: "POST",
        body: { uid: user.uid, email: user.email, displayName: user.displayName, role },
      });
    } catch {
      // If backend is down, still set locally
      console.warn("Failed to persist role to backend — continuing locally");
    }

    setUser((prev) => prev ? { ...prev, role } : null);
  };

  const logout = async () => {
    setIsDemo(false);
    setUser(null);
    try {
      await signOut(firebaseAuthClient);
    } catch {
      // Already signed out
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, loginWithGoogle, loginAsDemo, selectRole, logout, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
