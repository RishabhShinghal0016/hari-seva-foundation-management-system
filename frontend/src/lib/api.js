const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Static files (uploaded QR code, etc.) are served from the server root, not under /api,
// so asset URLs need the API path stripped back off.
const SERVER_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const storedToken = token || localStorage.getItem("hsfms_token");
  if (storedToken) headers.Authorization = `Bearer ${storedToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isCsv = res.headers.get("content-type")?.includes("text/csv");
  if (isCsv) return res.blob();

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
  downloadCsv: async (path, filename) => {
    const blob = await request(path);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export { BASE_URL, SERVER_ORIGIN };
