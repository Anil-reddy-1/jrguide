const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
};

export const apiClient = async <T = unknown>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { method = "GET", body, headers = {}, formData } = options;

  const finalHeaders: Record<string, string> = { ...headers };

  // Try to get Firebase token
  try {
    const { firebaseAuthClient } = await import("../config/firebase");
    const currentUser = firebaseAuthClient.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Not logged in via Firebase — demo mode
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
