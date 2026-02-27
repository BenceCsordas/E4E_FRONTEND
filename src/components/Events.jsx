import React, { useEffect, useState } from "react";
import { addEvent, readEvents, deleteEvent, readMe } from "../utils";
import EventCard from "./EventCard";

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

  // ---- betöltés ----
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
        return (<EventCard ev={ev} isOwner={isOwner} setEvents={setEvents}/>)        
      })}
    </div>
  </div>
);
};

export default Events;