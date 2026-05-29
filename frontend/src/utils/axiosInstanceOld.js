import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN_URL,
  withCredentials: true, // Change to true
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (originalError) => {
    // ← rename to originalError
    const originalRequest = originalError.config;

    const isAuthRoute =
      originalRequest.url?.includes("/users/login") ||
      originalRequest.url?.includes("/users/register");

    if (
      originalError.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          return Promise.reject(originalError); // ← originalError
        }

        const response = await axios.post(
          `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken)
            localStorage.setItem("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return Promise.reject(originalError);
      }
    }

    return Promise.reject(originalError);
  },
);

export default axiosInstance;
