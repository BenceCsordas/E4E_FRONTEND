import imageCompression from "browser-image-compression";
import { backendApi } from "./backendApi";

// ---------------------------
// IMAGE COMPRESSION SETTINGS
// ---------------------------
const compressImage = async (file) => {
  if (!file) return null;

  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    return await imageCompression(file, options);
  } catch (e) {
    console.log("Tömörítés hiba, megy az eredeti file:", e);
    return file;
  }
};

// ---------------------------
// IMAGE UPLOAD (BACKENDEN KERESZTÜL)
// ---------------------------
export const uploadImage = async (file) => {
  try {
    if (!file) return null;

    const compressed = await compressImage(file);

    const form = new FormData();
    form.append("image", compressed);

    const res = await backendApi.post("/api/uploadImage", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // { url, delete_url }
    return res.data;
  } catch (error) {
    console.log("Képfeltöltési hiba (backend):", error?.response?.data || error.message);
    return null;
  }
};

// Több kép feltöltése egyszerre
// files: File[] tömb
// Visszatér: [{ url, delete_url }, ...]
export const uploadImages = async (files) => {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(files.map((file) => uploadImage(file)));
  // null értékeket kiszűrjük
  return results.filter((r) => r?.url);
};

export const deleteImage = async (delete_url) => {
  try {
    if (!delete_url) return;
    await backendApi.post("/api/deleteImage", { delete_url });
  } catch (error) {
    console.log("Képtörlési hiba (backend):", error?.response?.data || error.message);
  }
};

// Több kép törlése egyszerre
export const deleteImages = async (images) => {
  if (!images || images.length === 0) return;
  await Promise.all(
    images.map((img) => img?.delete_url ? deleteImage(img.delete_url) : Promise.resolve())
  );
};

// ---------------------------
// USERS
// ---------------------------
export const registerUser = async ({ name, email, password }) => {
  try {
    const res = await backendApi.post("/users/register", { name, email, password });
    return res.data; // { ok, uid }
  } catch (error) {
    console.log("Register hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const ensureMe = async (name) => {
  try {
    const res = await backendApi.post("/users/me/ensure", { name });
    return res.data; // { ok, created }
  } catch (error) {
    console.log("ensureMe hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const readMe = async () => {
  try {
    const res = await backendApi.get("/users/me");
    return res.data;
  } catch (error) {
    console.log("Me read hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const updateMe = async ({ name }) => {
  try {
    const res = await backendApi.put("/users/me", { name });
    return res.data;
  } catch (error) {
    console.log("Me update hiba:", error?.response?.data || error.message);
    return null;
  }
};

// ---------------------------
// EVENTS
// ---------------------------
export const readEvents = async (limit = 50) => {
  try {
    const res = await backendApi.get("/events", { params: { limit } });
    return res.data; // { count, events, limit }
  } catch (error) {
    console.log("Events read hiba:", error?.response?.data || error.message);
    return { count: 0, events: [], limit };
  }
};

export const readEventById = async (id, setEvent) => {
  try {
    const res = await backendApi.get(`/events/${id}`);
    setEvent(res.data);
  } catch (error) {
    console.log("Event read hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const readMyEvents = async (limit = 50) => {
  try {
    const res = await backendApi.get("/events/mine", { params: { limit } });
    return res.data;
  } catch (error) {
    console.log("My events read hiba:", error?.response?.data || error.message);
    return { count: 0, events: [], limit };
  }
};

export const readRegisteredEvents = async (limit = 50) => {
  try {
    const res = await backendApi.get("/events/registered", { params: { limit } });
    return res.data;
  } catch (error) {
    console.log("Registered events read hiba:", error?.response?.data || error.message);
    return { count: 0, events: [] };
  }
};

// eventData: { title, address, description }
// files: File[] tömb (több kép)
export const addEvent = async (eventData, files = []) => {
  try {
    // Több kép feltöltése párhuzamosan
    const images = await uploadImages(files);

    const res = await backendApi.post("/events", {
      title: eventData.title,
      location: eventData.address,
      description: eventData.description,
      images, // [{ url, delete_url }, ...]
    });

    return res.data;
  } catch (error) {
    console.log("Event add hiba:", error?.response?.data || error.message);
    return null;
  }
};

// updateData: { title, location, description, images? }
// newFiles: File[] tömb – új képek feltöltése
// removedImages: [{ url, delete_url }] – törlendő képek
export const updateEvent = async (id, updateData, newFiles = [], removedImages = []) => {
  try {
    // 1. Régi képek törlése
    await deleteImages(removedImages);

    // 2. Új képek feltöltése
    const uploadedImages = await uploadImages(newFiles);

    // 3. Meglévő képek + új képek összefűzése
    const existingImages = (updateData.images || []).filter(
      (img) => !removedImages.some((r) => r.url === img.url)
    );
    const allImages = [...existingImages, ...uploadedImages];

    const res = await backendApi.put(`/events/${id}`, {
      title: updateData.title,
      location: updateData.location,
      description: updateData.description,
      images: allImages,
    });

    return res.data;
  } catch (error) {
    console.log("Event update hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const deleteEvent = async (id, images = []) => {
  try {
    // összes kép törlése
    await deleteImages(images);

    const res = await backendApi.delete(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.log("Event delete hiba:", error?.response?.data || error.message);
    return null;
  }
};

// ---------------------------
// REGISTRATIONS
// ---------------------------
export const registerToEvent = async (eventId) => {
  try {
    const res = await backendApi.post(`/events/${eventId}/register`);
    return res.data; // { ok, msg }
  } catch (error) {
    console.log("Jelentkezés hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const unregisterFromEvent = async (eventId) => {
  try {
    const res = await backendApi.delete(`/events/${eventId}/register`);
    return res.data; // { ok, msg }
  } catch (error) {
    console.log("Leiratkozás hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const readEventRegistrations = async (eventId) => {
  try {
    const res = await backendApi.get(`/events/${eventId}/registrations`);
    return res.data; // { count, registrations }
  } catch (error) {
    console.log("Jelentkezők read hiba:", error?.response?.data || error.message);
    return { count: 0, registrations: [] };
  }
};
export const readRegistrationCounts = async () => {
  try {
    const res = await backendApi.get("/events/registration-counts");
    return res.data.counts; // { [eventId]: number }
  } catch (error) {
    console.log("Registration counts hiba:", error?.response?.data || error.message);
    return {};
  }
};
