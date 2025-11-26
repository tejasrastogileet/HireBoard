import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL not set — defaulting to local backend:", API_URL);
}

console.log(`📝 Frontend API Base URL: ${API_URL}`);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add response error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error(`❌ 404 Error - API endpoint not found:`, error.config?.url);
      console.error(`   Full URL: ${error.config?.baseURL}${error.config?.url}`);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
