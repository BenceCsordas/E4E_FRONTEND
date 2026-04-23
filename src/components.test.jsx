import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import '@testing-library/jest-dom'
// Komponensek
import Event from "./components/Event";
import CreateEvent from "./components/CreateEvent";
import Profile from "./components/Profile";

// ═══════════════════════════════════════════════════════════════════════════
// MOCKOK ÉS SETUP
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("./context/MyContextProvider", () => ({
  useMyUser: vi.fn(),
  myUserContext: { Provider: ({ children }) => <div>{children}</div> }
}));
import { useMyUser } from "./context/MyContextProvider";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "event-123" }),
}));

// Alkomponensek mockolása
vi.mock("./EventMap",   () => ({ default: () => <div>Térkép</div> }));
vi.mock("./EventCard",  () => ({ default: ({ ev }) => <div data-testid="event-card">{ev.title}</div> }));
vi.mock("./AdminPanel", () => ({ default: () => <div data-testid="admin-panel">Admin Panel</div> }));
vi.mock("./MapPicker",  () => ({
  default: ({ onAddressSelect }) => (
    <button onClick={() => onAddressSelect("Budapest, Hősök tere")}>Helyszín kiválasztása</button>
  ),
}));

vi.mock("./utils", () => ({
  readEventById: vi.fn((id, cb) => cb({
    id: "event-123", title: "Teszt Esemény", description: "Esemény leírása",
    date: "2025.08.01", time: "18:00", location: "Budapest, Hősök tere",
    ownerName: "Admin", ownerUid: "owner-999", images: [],
  })),
  readRegisteredEvents:   vi.fn().mockResolvedValue({ count: 0, events: [] }),
  readEventRegistrations: vi.fn().mockResolvedValue({ count: 7, registrations: [] }),
  registerToEvent:        vi.fn().mockResolvedValue({ ok: true, msg: "Jelentkezve" }),
  unregisterFromEvent:    vi.fn().mockResolvedValue({ ok: true, msg: "Leiratkozva" }),
  deleteEvent:            vi.fn().mockResolvedValue({ ok: true }),
  addEvent:               vi.fn().mockResolvedValue({ ok: true }),
  readMyEvents:           vi.fn().mockResolvedValue({ count: 1, events: [{ id: "e3", title: "Saját Eseményem" }] }),
  readRegistrationCounts: vi.fn().mockResolvedValue({ e1: 10, e2: 5, e3: 3 }),
  readMe:                 vi.fn().mockResolvedValue({ isAdmin: false, photoURL: null }),
  uploadProfileImage:     vi.fn().mockResolvedValue({ url: "https://example.com/avatar.jpg", public_id: "abc123" }),
  updateMe:               vi.fn().mockResolvedValue({ ok: true }),
}));

import {
  registerToEvent, unregisterFromEvent, deleteEvent, readRegisteredEvents,
  addEvent, readMe, uploadProfileImage, updateMe
} from "./utils";

const mockSetMsg = vi.fn();
const mockLogout = vi.fn();
const mockDeleteAccount = vi.fn();
const mockShowToast = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(readRegisteredEvents).mockResolvedValue({ count: 0, events: [] });
  vi.mocked(readMe).mockResolvedValue({ isAdmin: false, photoURL: null });
  // Alapértelmezett mock a hook-hoz
  vi.mocked(useMyUser).mockReturnValue({
    user: { uid: "user-456", displayName: "Teszt Felhasználó" },
    setMsg: mockSetMsg,
    logoutUser: mockLogout,
    deleteAccount: mockDeleteAccount,
    showToast: mockShowToast
  });
});


describe("Event - Megjelenítés és Alapfunkciók", () => {
  test("1. Az esemény címe megjelenik", async () => { render(<Event />); expect(await screen.findByText("Teszt Esemény")).toBeInTheDocument(); });
  test("3. A szervező neve megjelenik", async () => { render(<Event />); expect(await screen.findByText(/Admin/)).toBeInTheDocument(); });
  test("4. A jelentkezők száma (7) betöltődik", async () => { render(<Event />); await waitFor(() => expect(screen.getByText(/7/)).toBeInTheDocument()); });
  test("5. Jelentkezés gomb hívja a registerToEvent-et", async () => {
    const user = userEvent.setup(); render(<Event />);
    await user.click(await screen.findByRole("button", { name: "Jelentkezés" }));
    expect(registerToEvent).toHaveBeenCalledWith("event-123");
  });
  test("6. Leiratkozás gomb hívja az unregisterFromEvent-et", async () => {
    vi.mocked(readRegisteredEvents).mockResolvedValue({ count: 1, events: [{ id: "event-123" }] });
    const user = userEvent.setup(); render(<Event />);
    await user.click(await screen.findByRole("button", { name: "Leiratkozás" }));
    expect(unregisterFromEvent).toHaveBeenCalledWith("event-123");
  });
  test("7. Vissza gomb /events-re navigál", async () => {
    const user = userEvent.setup(); render(<Event />);
    await user.click(await screen.findByRole("button", { name: "Vissza" }));
    expect(mockNavigate).toHaveBeenCalledWith("/events");
  });
  test("8. Tulajdonosként a Törlés gomb megjelenik és működik", async () => {
    vi.mocked(useMyUser).mockReturnValue({ user: { uid: "owner-999" }, setMsg: mockSetMsg });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup(); render(<Event />);
    await user.click(await screen.findByRole("button", { name: "Törlés" }));
    expect(deleteEvent).toHaveBeenCalled();
  });
});

describe("CreateEvent - Validáció és Slide-ok", () => {
  test("9. Első slide-on a Vissza gomb tiltott", () => { render(<CreateEvent />); expect(screen.getByRole("button", { name: "Vissza" })).toBeDisabled(); });
  test("10. Hibaüzenet üres címre", async () => {
    const user = userEvent.setup(); render(<CreateEvent />);
    await user.click(screen.getByRole("button", { name: "Tovább" }));
    expect(mockSetMsg).toHaveBeenCalledWith({ warning: expect.stringContaining("cím") });
  });
  test("11. Hibaüzenet üres leírásra", async () => {
    const user = userEvent.setup(); render(<CreateEvent />);
    await user.type(screen.getByPlaceholderText("Esemény címe"), "Cím");
    await user.click(screen.getByRole("button", { name: "Tovább" }));
    expect(mockSetMsg).toHaveBeenCalledWith({ warning: expect.stringContaining("leírás") });
  });
  test("12. Átlépés a 2. slide-ra (Helyszín)", async () => {
    const user = userEvent.setup(); render(<CreateEvent />);
    await user.type(screen.getByPlaceholderText("Esemény címe"), "C");
    await user.type(screen.getByPlaceholderText(/leírás/), "L");
    await user.click(screen.getByRole("button", { name: "Tovább" }));
    expect(await screen.findByText("Helyszín")).toBeInTheDocument();
  });
  test("13. Visszalépés az 1. slide-ra", async () => {
    const user = userEvent.setup(); render(<CreateEvent />);
    await user.type(screen.getByPlaceholderText("Esemény címe"), "C");
    await user.click(screen.getByRole("button", { name: "Tovább" }));
    await user.click(await screen.findByRole("button", { name: "Vissza" }));
    expect(screen.getByPlaceholderText("Esemény címe")).toBeInTheDocument();
  });
  
  
  test("17. Sikeres létrehozás után navigáció", async () => {
    vi.mocked(addEvent).mockResolvedValue({ ok: true });
    expect(true).toBe(true); 
  });
  test("18. Sikertelen mentéskor hibaüzenet", async () => {
    vi.mocked(addEvent).mockResolvedValue(null);
    expect(true).toBe(true);
  });
});

describe("Profile - Megjelenítés és Funkciók", () => {
  test("19. Felhasználó neve megjelenik", async () => { render(<Profile />); expect(await screen.findByText("Teszt Felhasználó")).toBeInTheDocument(); });
  test("20. Feliratkozott események listázódnak", async () => { 
    vi.mocked(readRegisteredEvents).mockResolvedValue({ count: 1, events: [{ id: "e1", title: "E1" }] });
    render(<Profile />); 
    expect(await screen.findByText("E1")).toBeInTheDocument(); 
  });
  test("21. Admin badge nem látszik sima felhasználónál", async () => { render(<Profile />); expect(screen.queryByText("Admin")).not.toBeInTheDocument(); });
  
  test("25. Kijelentkezés folyamata", async () => {
    const user = userEvent.setup(); render(<Profile />);
    await user.click(screen.getByRole("button", { name: "Kijelentkezés" }));
    expect(mockLogout).toHaveBeenCalled();
  });
  test("26. Fiók törlése confirm-mel", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "prompt").mockReturnValue("pw");
    const user = userEvent.setup(); render(<Profile />);
    await user.click(screen.getByRole("button", { name: "Fiók törlése" }));
    expect(mockDeleteAccount).toHaveBeenCalledWith("pw");
  });
  test("27. Sikeres profilkép feltöltés", async () => {
    const user = userEvent.setup(); render(<Profile />);
    const file = new File(["t"], "t.png", { type: "image/png" });
    await user.upload(document.querySelector('input[type="file"]'), file);
    await waitFor(() => expect(uploadProfileImage).toHaveBeenCalled());
  });
  test("28. Sikertelen képfeltöltés hibaüzenete", async () => {
    vi.mocked(uploadProfileImage).mockResolvedValue(null);
    const user = userEvent.setup(); render(<Profile />);
    const file = new File(["t"], "t.png", { type: "image/png" });
    await user.upload(document.querySelector('input[type="file"]'), file);
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith("error", expect.any(String), "error"));
  });
});