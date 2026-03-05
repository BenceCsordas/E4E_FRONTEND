import React, { useContext, useEffect, useState } from 'react'
import { deleteEvent, readEventById } from '../utils'
import { useNavigate, useParams } from 'react-router'
import { myUserContext } from '../context/MyContextProvider'
import './Event.css'
import EventMap from './EventMap'

const Event = () => {
    const { user } = useContext(myUserContext)
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImgIndex, setCurrentImgIndex] = useState(0)
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        if (id) {
            readEventById(id, (data) => {
                setEvent(data);
                setLoading(false);
            });
        }
    }, [id])

    // --- Galéria képek összeállítása ---
    // Támogatja az images[] tömböt és a régi imageUrl mezőt is
    const getGalleryImages = (ev) => {
        if (!ev) return [];
        if (Array.isArray(ev.images) && ev.images.length > 0) {
            return ev.images.map((img, i) => ({ id: i, url: img.url }));
        }
        if (ev.imageUrl) {
            return [{ id: 0, url: ev.imageUrl }];
        }
        return [];
    };

    const galleryImages = getGalleryImages(event);
    const hasImages = galleryImages.length > 0;

    // Hero kép: első kép
    const heroUrl = hasImages ? galleryImages[0].url : null;

    const nextImage = () => {
        setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const handleDelete = async (ev) => {
        const ok = confirm(`Biztos törlöd? (${ev.title})`);
        if (!ok) return;

        const imagesToDelete = Array.isArray(ev.images) && ev.images.length > 0
            ? ev.images
            : (ev.imageDeleteUrl ? [{ delete_url: ev.imageDeleteUrl }] : []);

        const res = await deleteEvent(ev.id, imagesToDelete);
        if (res?.ok) {
            navigate("/events")
        } else {
            alert("Nem sikerült törölni");
        }
    };

    if (loading) return <div className="loading">Betöltés...</div>
    if (!event) return <div className="loading">Esemény nem található.</div>

    return (
        <div className="event-container">
            <div className="event-hero">
                {heroUrl ? (
                    <img className="event-hero-img" src={heroUrl} alt={event.title} />
                ) : (
                    <div className="event-hero-placeholder" />
                )}
                <div className="event-hero-overlay">
                    <h1>{event.title}</h1>
                </div>
            </div>

            <div className="event-content-wrapper">
                {/* BAL OLDAL - Fő tartalom */}
                <main className="main-card">
                    <div className="info-bar">
                        <div className="info-item">
                            <span>📍</span> {event.location || "Helyszín nincs megadva"}
                        </div>
                        <div className="info-item">
                            <span>👤</span> Szervező: {event.ownerName}
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Esemény leírása</h3>
                        <div className="description-text">
                            {event.description}
                        </div>
                    </div>

                    {/* GALÉRIA */}
                    <div className="gallery-section">
                        <h3>Galéria</h3>

                        {hasImages ? (
                            <div className="mini-slider">
                                <img
                                    src={galleryImages[currentImgIndex].url}
                                    className="slider-img"
                                    alt={`Kép ${currentImgIndex + 1}`}
                                />

                                {galleryImages.length > 1 && (
                                    <>
                                        <button className="slider-btn prev" onClick={prevImage} type="button">❮</button>
                                        <button className="slider-btn next" onClick={nextImage} type="button">❯</button>

                                        <div className="slider-dots">
                                            {galleryImages.map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`dot ${i === currentImgIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImgIndex(i)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="gallery-empty">Nincs feltöltött kép</div>
                        )}
                    </div>
                </main>

                {/* JOBB OLDAL - Sidebar */}
                <div className="sidebar-container">
                    <aside className="sidebar-card">
                        <div className="button-group">
                            <button className="btn btn-sub">Jelentkezés</button>
                            <button className="btn btn-sub" onClick={() => navigate("/events")}>Vissza</button>
                            {user && user.uid === event.ownerUid && (
                                <div className="owner-actions">
                                    <button className="btn btn-sub">Szerkesztés</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(event)}>Törlés</button>
                                </div>
                            )}
                        </div>
                    </aside>

                    <aside className="sidebar-card">
                        <h3>Helyszín</h3>
                        <h3>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='locationText'
                            >
                                {event.location}
                            </a>
                        </h3>
                        <EventMap address={event.location} />
                </aside>
                </div>
            </div>
        </div>
    )
}

export default Event