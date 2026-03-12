import React, { useEffect, useState } from "react";
import { addEvent, readEvents, deleteEvent, readMe, readRegistrationCounts } from "../utils";
import EventCard from "./EventCard";

const Events = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [regCounts, setRegCounts] = useState({});

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setErr("");

    const eventsData = await readEvents(200);
    setEvents(eventsData?.events || []);

    const me = await readMe();
    setCurrentUser(me || null);

    const counts = await readRegistrationCounts();
    setRegCounts(counts);

    setLoading(false);
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
            <EventCard
              key={ev.id}
              ev={ev}
              isOwner={isOwner}
              setEvents={setEvents}
              regCount={regCounts[ev.id] ?? 0}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Events;