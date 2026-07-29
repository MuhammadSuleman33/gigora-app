import axios from "axios";

const getBaseURL = () => {
  const apiURL = process.env.REACT_APP_API_URL?.trim();

  console.log("REACT_APP_API_URL:", apiURL);

  if (apiURL) {
    return apiURL.replace(/\/+$/, "");
  }

  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname
      : "localhost";

  return `http://${hostname}:8000`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gigora_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;