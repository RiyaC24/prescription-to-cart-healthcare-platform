import axios from "axios";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Basic 401 -> refresh-once-and-retry flow. Kept intentionally simple for Phase 1.
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = getStoredTokens();
        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        setStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearStoredTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
