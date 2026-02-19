import React, { useEffect, useState } from "react";
import { addEvent, readEvents, deleteEvent, readMe } from "../utils";

const Events = () => {
  // form state (mint a recipe)
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  // data state
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ui state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ---- betöltés (recipe stílus: egyszerű useEffect) ----
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setErr("");

    // 1) események
    const eventsData = await readEvents(200);
    setEvents(eventsData?.events || []);

    // 2) saját user
    const me = await readMe();
    setCurrentUser(me || null);

    setLoading(false);
  };

  // ---- create ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addEvent({ title, location, description }, file);

    if (result?.ok) {
      alert("Sikeres létrehozás!");
      setTitle("");
      setLocation("");
      setDescription("");
      setFile(null);

      loadAll();
    } else {
      alert("Hiba történt!");
    }
  };

  // ---- delete ----
  const handleDelete = async (ev) => {
    const ok = confirm(`Biztos törlöd? (${ev.title})`);
    if (!ok) return;

    const res = await deleteEvent(ev.id, ev.imageDeleteUrl);
    if (res?.ok) {
      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    } else {
      alert("Nem sikerült törölni");
    }
  };

  // ---- edit (később) ----
  const handleEdit = (ev) => {
    console.log("Szerkesztés:", ev);
  };

  return (

  <div className="eventsPage">
    <div className="eventsHeader">
      <h1>Események</h1>
      <p>Fedezd fel az összes eseményt.</p>
    </div>

    {loading && <div className="status">Betöltés…</div>}
    {err && <div className="status error">{err}</div>}

    <div className="eventsGrid">
      {events.map((ev) => {
        const isOwner = currentUser && ev.ownerUid === currentUser.id;

        return (
          <div className="eventCard" key={ev.id}>
            <div className="eventImageWrap">
              {ev.imageUrl ? (
                <img
                  className="eventImage"
                  src={ev.imageUrl}
                  alt={ev.title}
                />
              ) : (
                <div className="eventImagePlaceholder">
                  Nincs kép
                </div>
              )}
            </div>

            <div className="eventBody">
              <h3 className="eventTitle">{ev.title}</h3>

              {ev.location && (
                <div className="eventMeta">📍 {ev.location}</div>
              )}

              {ev.description && (
                <p className="eventDesc">{ev.description}</p>
              )}

              <div className="eventFooter">
                <div className="eventOwner">
                  Szervező: {ev.ownerName || "Ismeretlen"}
                </div>

                {isOwner && (
                  <div className="eventActions">
                    <button onClick={() => handleEdit(ev)}>
                      Szerkesztés
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(ev)}
                    >
                      Törlés
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
};

export default Events;