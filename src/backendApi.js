import axios from "axios";
import { auth } from "./firebaseApp"; // ⚠️ nálad ez a fájl neve lehet más, igazítsd

export const backendApi = axios.create({
  baseURL: "http://localhost:8000",
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
