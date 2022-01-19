import axios from "axios";
import { SERVER_URL } from "configs";

const defaultOptions = {
  baseURL: SERVER_URL,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// Create instance
let axiosInstance = axios.create(defaultOptions);

// Set the AUTH token for any request
axiosInstance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export default axiosInstance;
