import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("❌ CRITICAL: VITE_API_URL is not set in environment variables");
  console.error("   Expected: https://hireboard-production.up.railway.app/api");
  console.error("   This will cause all API calls to fail");
}

console.log(`📝 Frontend API Base URL: ${API_URL || "NOT SET - USING RELATIVE PATHS"}`);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
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
