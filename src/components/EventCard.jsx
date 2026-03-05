import React from 'react'
import { useNavigate } from 'react-router';
import { deleteEvent } from '../utils';
import "./EventCard.css"

const EventCard = ({ev, isOwner, setEvents}) => {
    const navigate = useNavigate()

    // Első kép lekérése: images tömb vagy régi imageUrl alapján
    const getFirstImage = () => {
        if (Array.isArray(ev.images) && ev.images.length > 0) {
            return ev.images[0].url;
        }
        if (ev.imageUrl) {
            return ev.imageUrl;
        }
        return null;
    };

    const firstImage = getFirstImage();
    const imageCount = Array.isArray(ev.images) ? ev.images.length : (ev.imageUrl ? 1 : 0);

    const loadEvent = (event) => {
        navigate("/event/" + event.id)
    }

    // ---- delete ----
    const handleDelete = async (ev) => {
        const ok = confirm(`Biztos törlöd? (${ev.title})`);
        if (!ok) return;

        // images tömb vagy régi imageDeleteUrl
        const imagesToDelete = Array.isArray(ev.images) && ev.images.length > 0
            ? ev.images
            : (ev.imageDeleteUrl ? [{ delete_url: ev.imageDeleteUrl }] : []);

        const res = await deleteEvent(ev.id, imagesToDelete);
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
        <div className="eventCard" key={ev.id}>
            <div className="eventImageWrap">
                {firstImage ? (
                    <div className="eventImageContainer" onClick={() => loadEvent(ev)}>
                        <img
                            className="eventImage"
                            src={firstImage}
                            alt={ev.title}
                        />
                        {imageCount > 1 && (
                            <div className="imageCountBadge">
                                +{imageCount - 1} kép
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="eventImagePlaceholder" onClick={() => loadEvent(ev)}>
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