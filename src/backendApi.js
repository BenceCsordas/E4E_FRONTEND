import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const backendApi = axios.create({
  baseURL: API_BASE,
});

backendApi.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
