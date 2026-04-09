import axios from "axios";
import { logout } from "@/utils/logout";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest =
      typeof requestUrl === "string" && requestUrl.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
