import axios from "axios";

const api = axios.create({
  baseURL: "https://api.ecom.palqar.cloud/v1",
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    console.log("TOKEN SENT:", token);
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
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
