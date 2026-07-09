import { API_BASE } from "./authApi.js";

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || "Google sign-in failed.";
    throw new Error(message);
  }
  return data;
}

/**
 * Sends the Google ID token to our backend, which verifies it
 * and returns our own JWT — exactly like login()/register().
 */
export async function googleLogin(idToken) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return handleResponse(res);
}