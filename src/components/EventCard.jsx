import React from 'react'
import { useNavigate } from 'react-router';
import { deleteEvent } from '../utils';
import "./EventCard.css"

const EventCard = ({ev, isOwner, setEvents, regCount}) => {
    const navigate = useNavigate()

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

    const handleDelete = async (ev) => {
        const ok = confirm(`Biztos törlöd? (${ev.title})`);
        if (!ok) return;

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

    
    return (
        <div className="eventCard" key={ev.id} onClick={() => loadEvent(ev)}>
            <div className="eventImageWrap">
                {firstImage ? (
                    <div className="eventImageContainer">
                        <img
                            className="eventImage"
                            src={firstImage}
                            alt={ev.title}
                        />
                        
                    </div>
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
                        <p>
                            Szervező: {ev.ownerName || "Ismeretlen"} 
                        </p>
                        <p>
                            {regCount} jelentkező
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventCard