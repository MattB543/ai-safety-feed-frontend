// The backend (Express on Render). Set VITE_API_BASE_URL in .env / Netlify.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Carries the HTTP status and, when the body is JSON, the backend's
// `{ error }` message.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// `params` is a URLSearchParams (use it for repeated keys) or a plain object;
// undefined, null and "" values are dropped.
export function apiUrl(path, params) {
  const search =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params || {}).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
          )
        );
  const qs = search.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

async function request(url, init) {
  const response = await fetch(url, init);
  let body = null;
  try {
    body = await response.json();
  } catch (err) {
    // An abort can land while the body is still being read; let callers see it.
    if (err.name === "AbortError") throw err;
    // Non-JSON body (e.g. a proxy error page); the status says enough.
  }
  if (!response.ok) {
    throw new ApiError(
      body?.error || body?.message || `HTTP error! Status: ${response.status}`,
      response.status
    );
  }
  return body;
}

export function getJson(path, { params, signal } = {}) {
  return request(apiUrl(path, params), { signal });
}

export function postJson(path, data) {
  return request(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
