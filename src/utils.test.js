import { describe, it, expect, vi, beforeEach } from "vitest";
import '@testing-library/jest-dom'
// --- Mockok ---

// backendApi mock
vi.mock("./backendApi", () => ({
  backendApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// browser-image-compression mock
vi.mock("browser-image-compression", () => ({
  default: vi.fn((file) => Promise.resolve(file)),
}));

import { backendApi } from "./backendApi";
import {
  uploadImage,
  uploadImages,
  deleteImage,
  deleteImages,
  registerUser,
  readMe,
  updateMe,
  readEvents,
  readEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  registerToEvent,
  unregisterFromEvent,
  readEventRegistrations,
} from "./utils";

// FormData mock (jsdom-ban nem mindig elérhető)
global.FormData = class {
  constructor() { this._data = {}; }
  append(key, value) { this._data[key] = value; }
};

// ---------------------------
// IMAGE UPLOAD / DELETE
// ---------------------------
describe("uploadImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("null-t ad vissza ha nincs file", async () => {
    const result = await uploadImage(null);
    expect(result).toBeNull();
  });

  it("visszaadja a { url, delete_url } objektumot sikeres feltöltéskor", async () => {
    backendApi.post.mockResolvedValue({ data: { url: "http://img.hu/a.jpg", delete_url: "http://del/a" } });

    const file = new File(["x"], "test.jpg", { type: "image/jpeg" });
    const result = await uploadImage(file);

    expect(backendApi.post).toHaveBeenCalledWith(
      "/api/uploadImage",
      expect.any(FormData),
      expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } })
    );
    expect(result).toEqual({ url: "http://img.hu/a.jpg", delete_url: "http://del/a" });
  });

  it("null-t ad vissza hiba esetén", async () => {
    backendApi.post.mockRejectedValue(new Error("network error"));
    const file = new File(["x"], "fail.jpg", { type: "image/jpeg" });
    const result = await uploadImage(file);
    expect(result).toBeNull();
  });
});

describe("uploadImages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("üres tömböt ad vissza ha nincs file", async () => {
    const result = await uploadImages([]);
    expect(result).toEqual([]);
  });

  it("kiszűri a null eredményeket", async () => {
    backendApi.post
      .mockResolvedValueOnce({ data: { url: "http://img.hu/a.jpg", delete_url: "del_a" } })
      .mockRejectedValueOnce(new Error("fail"));

    const files = [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ];
    const result = await uploadImages(files);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("http://img.hu/a.jpg");
  });
});

describe("deleteImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("nem hív API-t ha nincs delete_url", async () => {
    await deleteImage(null);
    expect(backendApi.post).not.toHaveBeenCalled();
  });

  it("meghívja a backend delete végpontját", async () => {
    backendApi.post.mockResolvedValue({ data: { ok: true } });
    await deleteImage("http://del/a");
    expect(backendApi.post).toHaveBeenCalledWith("/api/deleteImage", { delete_url: "http://del/a" });
  });
});

describe("deleteImages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("nem csinál semmit üres tömbön", async () => {
    await deleteImages([]);
    expect(backendApi.post).not.toHaveBeenCalled();
  });

  it("csak azokat törli amelyeknek van delete_url-je", async () => {
    backendApi.post.mockResolvedValue({ data: { ok: true } });
    await deleteImages([
      { url: "http://img/a.jpg", delete_url: "http://del/a" },
      { url: "http://img/b.jpg" }, // nincs delete_url
    ]);
    expect(backendApi.post).toHaveBeenCalledTimes(1);
    expect(backendApi.post).toHaveBeenCalledWith("/api/deleteImage", { delete_url: "http://del/a" });
  });
});

// ---------------------------
// USERS
// ---------------------------
describe("registerUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("visszaadja a { ok, uid } objektumot sikeres regisztrációkor", async () => {
    backendApi.post.mockResolvedValue({ data: { ok: true, uid: "abc123" } });
    const result = await registerUser({ name: "Teszt", email: "t@t.hu", password: "pass" });
    expect(result).toEqual({ ok: true, uid: "abc123" });
    expect(backendApi.post).toHaveBeenCalledWith("/users/register", {
      name: "Teszt",
      email: "t@t.hu",
      password: "pass",
    });
  });

  it("null-t ad vissza hiba esetén", async () => {
    backendApi.post.mockRejectedValue(new Error("fail"));
    const result = await registerUser({ name: "X", email: "x@x.hu", password: "123" });
    expect(result).toBeNull();
  });
});

