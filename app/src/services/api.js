import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_admin_server}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error cases here
      console.error("API Error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
