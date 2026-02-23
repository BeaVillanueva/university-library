import axios from "axios";

const LS_API_BASE = "ulms_api_base_url";

function getBaseUrl() {
  const fromLs = localStorage.getItem(LS_API_BASE);
  if (fromLs && fromLs.startsWith("http")) return fromLs;

  return (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost/university-library/backend/public"
  );
}

export function setApiBaseUrl(next) {
  if (!next) {
    localStorage.removeItem(LS_API_BASE);
    return;
  }
  localStorage.setItem(LS_API_BASE, next);
}

// axios instance
export const http = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000
});

// request interceptor: attach token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ulms_token");
  console.log("[HTTP] baseURL=", http.defaults.baseURL, "token?", !!token, "url=", config.url);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});