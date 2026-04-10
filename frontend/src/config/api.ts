const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000" : "");

type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
};

export const apiClient = async <T = unknown>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { method = "GET", body, headers = {}, formData } = options;

  if (!BASE_URL) {
    throw new Error("API URL is not configured. Set VITE_API_URL in frontend environment variables.");
  }

  const finalHeaders: Record<string, string> = { ...headers };

  try {
    // Try to get Firebase token
    const { firebaseAuthClient } = await import("../config/firebase");
    const currentUser = firebaseAuthClient.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      finalHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      // Check for demo token
      const demoToken = sessionStorage.getItem("demo_token");
      if (demoToken) {
        finalHeaders["Authorization"] = `Bearer ${demoToken}`;
      }
    }
  } catch {
    // Demo token might also be here if import fails
    const demoToken = sessionStorage.getItem("demo_token");
    if (demoToken) {
      finalHeaders["Authorization"] = `Bearer ${demoToken}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (formData) {
    fetchOptions.body = formData;
  } else if (body) {
    finalHeaders["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
    fetchOptions.headers = finalHeaders;
  }

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(errBody.error?.message ?? `API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data as T;
};
