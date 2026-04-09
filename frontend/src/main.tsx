import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { initializeFirebaseAnalytics } from "./config/firebase";
import { AuthProvider } from "./state/auth";

const queryClient = new QueryClient();

void initializeFirebaseAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontSize: "14px",
                borderRadius: "10px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#059669", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#dc2626", secondary: "#fff" },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
