import { useState, useEffect } from "react";
import "./Featured.css";
import { readEvents, readMe } from "../utils";
import { useNavigate } from "react-router";

const Featured = () => {
   const navigate = useNavigate();
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
  

  // Első 3 elem
  const data = events.slice(0, 3);

  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState("idle");

  // Ha az events megváltozik (betöltés után), reset
  useEffect(() => {
    setCurrent(0);
    setPhase("idle");
  }, [events]);

  const goTo = (index) => {
    if (phase !== "idle" || index === current || data.length <= 1) return;
    setPhase("exit");
    setTimeout(() => {
      setCurrent(index);
      setPhase("enter");
      setTimeout(() => setPhase("idle"), 350);
    }, 300);
  };

  const next = () => goTo((current + 1) % data.length);
  const prev = () => goTo((current - 1 + data.length) % data.length);

  const openEvent = (ev) => {
      navigate("/event/"+ev.id)
      console.log("/event/"+ev.id)
      console.log(ev.id)
      console.log("asd")
  }
  // Auto-advance
  useEffect(() => {
    if (phase !== "idle" || data.length <= 1) return;
    const t = setTimeout(next, 4500);
    return () => clearTimeout(t);
  }, [current, phase, data.length]);

  // --- Betöltés állapot ---
  if (loading) {
    return (
      <div className="featured-wrapper featured-wrapper--empty">
        <span className="featured-label">⭐ Kiemelt események</span>
        <div className="featured-skeleton">
          <div className="featured-skeleton__line featured-skeleton__line--title" />
          <div className="featured-skeleton__line featured-skeleton__line--meta" />
          <div className="featured-skeleton__line featured-skeleton__line--desc" />
        </div>
      </div>
    );
  }

  // --- Üres állapot ---
  if (data.length === 0) {
    return (
      <div className="featured-wrapper featured-wrapper--empty">
        <span className="featured-label">⭐ Kiemelt események</span>
        <div className="featured-empty">
          <span>Még nincsenek események</span>
        </div>
      </div>
    );
  }

  const ev = data[current];
  return (
    <div className="featured-wrapper">
      <span className="featured-label">⭐ Kiemelt események</span>

      {/* Háttér gradiens overlay */}
      <div className="featured-bg" />

      {/* Háttérkép ha van */}
      {ev.imageUrl && (
        <img className="featured-bg-img" src={ev.imageUrl} alt={ev.title} />
      )}

      {/* Tartalom */}
      <div className={`featured-content featured-content--${phase === "exit" ? "exit" : "enter"}`}>
        <h2
          className="featured-title"
          onClick={() =>openEvent(ev)}
        >
          {ev.title}
        </h2>

        {ev.location && (
          <div className="featured-meta">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {ev.location}
          </div>
        )}

        {ev.description && (
          <p className="featured-desc">{ev.description}</p>
        )}

        <div className="featured-footer">
          {ev.ownerName && (
            <span className="featured-owner">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {ev.ownerName}
            </span>
          )}
          <button
            className="featured-btn"
            onClick={() =>openEvent(ev)}
          >
            Részletek →
          </button>
        </div>
      </div>

      {/* Navigáció – csak ha több mint 1 elem van */}
      {data.length > 1 && (
        <div className="featured-nav">
          <button className="featured-arrow" onClick={prev} aria-label="Előző">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="featured-dots">
            {data.map((_, i) => (
              <button
                key={i}
                className={`featured-dot${i === current ? " featured-dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. esemény`}
              />
            ))}
          </div>

          <button className="featured-arrow" onClick={next} aria-label="Következő">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Progress bar */}
      {data.length > 1 && (
        <div className="featured-progress">
          <div className="featured-progress__bar" key={`${current}-${phase}`} />
        </div>
      )}
    </div>
  );
};

export default Featured;