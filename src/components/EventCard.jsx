import React from 'react'
import { useNavigate } from 'react-router';
import { deleteEvent } from '../utils';



const EventCard = ({ev, isOwner, setEvents}) => {
    const navigate = useNavigate()
    const loadEvent = (event) =>{
        navigate("/event/"+event.id)
    }
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
          <div className="eventCard" key={ev.id} >
            <div className="eventImageWrap">
              {ev.imageUrl ? (
                <img
                  onClick={()=>loadEvent(ev)}
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
}

export default EventCard
