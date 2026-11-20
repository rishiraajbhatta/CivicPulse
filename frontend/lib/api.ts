import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token and handle FormData headers properly.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("civicpulse_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired authentication without interrupting login attempts.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const currentPath = window.location.pathname;

      const isAuthenticationPage = currentPath === "/auth";

      const isLoginOrRegistrationRequest =
        error.config?.url?.includes("/api/citizens/login") ||
        error.config?.url?.includes("/api/citizens/register") ||
        error.config?.url?.includes("/api/moderators/login");

      if (
        status === 401 &&
        !isAuthenticationPage &&
        !isLoginOrRegistrationRequest
      ) {
        localStorage.removeItem("civicpulse_token");
        localStorage.removeItem("civicpulse_user");

        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default api;