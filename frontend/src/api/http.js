import axios from "axios";

const LS_API_BASE = "ulms_api_base_url";

function getBaseUrl() {
  const fromLs = localStorage.getItem(LS_API_BASE);

  if (fromLs && fromLs.startsWith("http")) {
    return fromLs;
  }

  // ✅ FIXED: Always use current hostname (works on any IP/domain)
  // This removes the isDev logic that was causing issues
  const host = window.location.hostname;
  const protocol = window.location.protocol;

  // Backend URL
  const defaultUrl =
    `${protocol}//${host}:8000/university-library/backend/public/index.php`;

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

  // ✅ IMPORTANT: Allow credentials for CORS
  withCredentials: true,

  timeout: 20000,
});

// Request interceptor
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ulms_token");

  console.log(
    "[HTTP]",
    config.method?.toUpperCase(),
    `${http.defaults.baseURL}${config.url}`,
    "token?",
    !!token
  );

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
http.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    // Network/CORS/backend unreachable
    if (!error.response) {
      console.error("[HTTP] Network/CORS error:", error);

      return Promise.reject({
        ...error,
        isNetworkError: true,
        message:
          "Cannot connect to server. Please check backend server and CORS settings.",
      });
    }

    // Unauthorized
    if (status === 401) {
      localStorage.removeItem("ulms_token");
      localStorage.removeItem("ulms_user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
