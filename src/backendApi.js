import axios from "axios";
import { auth } from "./firebaseApp";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const backendApi = axios.create({
  baseURL: isLocalhost 
    ? "http://localhost:8000" 
    : (import.meta.env.VITE_API_URL || "https://e4ebackend.vercel.app"),
});

backendApi.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);