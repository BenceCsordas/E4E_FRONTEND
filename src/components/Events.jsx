import React, { useEffect, useState } from "react";
import { addEvent, readEvents, deleteEvent, readMe, readRegistrationCounts } from "../utils";
import EventCard from "./EventCard";

const Events = () => {
  const [searched, setSearched] = useState("")
  
  // data state
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

  const filteredEvents = events.filter((ev) =>
    ev.title?.toLowerCase().includes(searched.toLowerCase()) ||
    ev.description?.toLowerCase().includes(searched.toLowerCase()) ||
    ev.location?.toLowerCase().includes(searched.toLowerCase())
  );

  return (
    <div className="eventsPage">
      <div className="eventsHeader">
        <h1>Események</h1>
        <p>Fedezd fel az összes eseményt.</p>
        <div className="group">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
          <input
            id="query"
            className="input"
            type="search"
            placeholder="Search..."
            name="searchbar"
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="status">Betöltés…</div>}
      {err && <div className="status error">{err}</div>}

      <div className="eventsGrid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => {
            const isOwner = currentUser && ev.ownerUid === currentUser.id;
            return <EventCard key={ev.id} ev={ev} isOwner={isOwner} setEvents={setEvents} />;
          })
        ) : (
          !loading && <div className="status">Nincs találat.</div>
        )}
      </div>
    </div>
  );
};

export default Events;