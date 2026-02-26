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

export const deleteImage = async (delete_url) => {
  try {
    if (!delete_url) return;
    await backendApi.post("/api/deleteImage", { delete_url });
  } catch (error) {
    console.log("Képtörlési hiba (backend):", error?.response?.data || error.message);
  }
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
    setEvent(res.data)
    // return res.data; // Egy darab event objektum
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

// eventData: { title, location }
// file: optional kép
export const addEvent = async (eventData, file) => {
  try {
    let imageUrl = null;
    let imageDeleteUrl = null;

    if (file) {
      const up = await uploadImage(file);
      if (up?.url) {
        imageUrl = up.url;
        imageDeleteUrl = up.delete_url || null;
      }
    }

    const res = await backendApi.post("/events", {
      title: eventData.title,
      location: eventData.address,
      description: eventData.description, 

      imageUrl,
      imageDeleteUrl,
    });

    return res.data;
  } catch (error) {
    console.log("Event add hiba:", error?.response?.data || error.message);
    return null;
  }
};


// updateData: { title, location, imageUrl?, imageDeleteUrl? }
// file: optional új kép -> feltölt + régi töröl
export const updateEvent = async (id, updateData, file) => {
  try {
    let imageUrl = updateData.imageUrl ?? null;
    let imageDeleteUrl = updateData.imageDeleteUrl ?? null;

    if (file) {
      const up = await uploadImage(file);

      if (up?.url) {
        // régi törlése
        if (imageDeleteUrl) await deleteImage(imageDeleteUrl);

        imageUrl = up.url;
        imageDeleteUrl = up.delete_url || null;
      }
    }

    // itt a backend PUT jelenleg csak title+location-t frissít
    // ezért: előbb frissítjük title/location, majd egy "patch" update a képre egy külön végpont híján:
    // Megoldás: a backend PUT-ba beleraktuk a képet is (lásd backend kód lent).
    const res = await backendApi.put(`/events/${id}`, {
      title: updateData.title,
      location: updateData.location,
      imageUrl,
      imageDeleteUrl,
    });

    return res.data;
  } catch (error) {
    console.log("Event update hiba:", error?.response?.data || error.message);
    return null;
  }
};

export const deleteEvent = async (id, imageDeleteUrl) => {
  try {
    // előbb kép törlés
    if (imageDeleteUrl) await deleteImage(imageDeleteUrl);

    const res = await backendApi.delete(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.log("Event delete hiba:", error?.response?.data || error.message);
    return null;
  }
};
