import { useEffect, useState } from "react";
import { addEvent, readEvents, deleteEvent, readMe } from "../utils";

const Events = () => {
  // form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  // data state
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      setErr("");

      const [eventsData, me] = await Promise.all([
        readEvents(200),
        readMe(), // 🔥 saját user
      ]);

      setEvents(eventsData?.events || []);
      setCurrentUser(me || null);
    } catch (e) {
      setErr("Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addEvent(
      { title, location, description },
      file
    );

    if (result?.ok) {
      setTitle("");
      setLocation("");
      setDescription("");
      setFile(null);
      await loadAll();
    } else {
      alert("Hiba történt!");
    }
  };

  const handleDelete = async (ev) => {
    const ok = confirm(`Biztos törlöd? (${ev.title})`);
    if (!ok) return;

    const res = await deleteEvent(ev.id, ev.imageDeleteUrl);
    if (res?.ok) {
      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    }
  };

  const handleEdit = (ev) => {
    console.log("Szerkesztés:", ev);
    // majd ide jön a modal / edit page
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Események</h1>
      
      {loading && <p>Betöltés…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {events.map((ev) => {
          const isOwner = currentUser && ev.ownerUid === currentUser.id;
          ev && console.log(ev.ownerUid, currentUser)

          return (
            <div
              key={ev.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{ev.title}</h3>
                  {ev.location && <div>📍 {ev.location}</div>}
                  {ev.ownerName && (
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      Szervező: {ev.ownerName}
                    </div>
                  )}
                </div>

                {/* 🔥 CSAK SAJÁT ESEMÉNYNÉL */}
                {isOwner && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(ev)}>
                      Szerkesztés
                    </button>

                    <button
                      onClick={() => handleDelete(ev)}
                      style={{ background: "red", color: "white" }}
                    >
                      Törlés
                    </button>
                  </div>
                )}
              </div>

              {ev.description && <p>{ev.description}</p>}

              {ev.imageUrl && (
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  style={{ width: "100%", borderRadius: 12 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Events;