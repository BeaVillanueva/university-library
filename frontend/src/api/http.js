import axios from "axios";

const LS_API_BASE = "ulms_api_base_url";

function getBaseUrl() {
  const fromLs = localStorage.getItem(LS_API_BASE);
  if (fromLs && fromLs.startsWith("http")) return fromLs;

  // ✅ FIX: Use localhost if development, otherwise use current hostname
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const host = isDev ? "localhost" : window.location.hostname;
  const protocol = window.location.protocol;
  
  const defaultUrl = `${protocol}//${host}:8000/university-library/backend/public/index.php`;

  return import.meta.env.VITE_API_BASE_URL || defaultUrl;
}

export function setApiBaseUrl(next) {
  if (!next) {
    localStorage.removeItem(LS_API_BASE);
    return;
  }
  localStorage.setItem(LS_API_BASE, next);
}

export const http = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
});

// request interceptor: attach token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ulms_token");
  console.log(
    "[HTTP] baseURL=",
    http.defaults.baseURL,
    "token?",
    !!token,
    "url=",
    config.url
  );

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptor: auto-logout on expired/invalid token
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    // ✅ Network error handler
    if (!error.response) {
      console.error("[HTTP] Network error:", error.message);
      // Return error so pages can show retry buttons
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: "Network error. Please check your connection and try again."
      });
    }

    if (status === 401) {
      localStorage.removeItem("ulms_token");
      localStorage.removeItem("ulms_user");

      // avoid redirect loop
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);