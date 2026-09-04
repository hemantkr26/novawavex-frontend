import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    /*
     * =========================================
     * 401 — UNAUTHORIZED
     * =========================================
     */

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenType");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    /*
     * =========================================
     * 403 — FORBIDDEN
     * =========================================
     */

    if (status === 403) {
      console.error(
        "NovaWavex: Access denied. Admin permission required."
      );
    }

    return Promise.reject(error);
  }
);

export default api;