import axios from "axios";

const API_BASE_URL = "https://gigora-app-production.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------
// Add access token to requests
// ----------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gigora_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Auto Refresh Expired Token
// ----------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Ignore if not 401
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("gigora_refresh_token");

    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        {
          refresh_token: refreshToken,
        }
      );

      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;

      localStorage.setItem(
        "gigora_access_token",
        newAccessToken
      );

      localStorage.setItem(
        "gigora_refresh_token",
        newRefreshToken
      );

      api.defaults.headers.common.Authorization =
        `Bearer ${newAccessToken}`;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return api(originalRequest);

    } catch (refreshError) {

      processQueue(refreshError, null);

      logout();

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

// ----------------------------
// Logout helper
// ----------------------------
function logout() {
  localStorage.removeItem("gigora_access_token");
  localStorage.removeItem("gigora_refresh_token");
  localStorage.removeItem("gigora_user");

  window.location.href = "/login";
}

export default api;