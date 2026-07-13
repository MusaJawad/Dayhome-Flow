import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5192/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dayhomeflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dayhomeflow_token");
      localStorage.removeItem("dayhomeflow_email");

      if (window.location.hash !== "#/auth") {
        window.location.assign("/#/auth");
      }
    }

    return Promise.reject(error);
  }
);

export default api;