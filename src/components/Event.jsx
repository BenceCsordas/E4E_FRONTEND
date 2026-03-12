import React, { useContext, useEffect, useState } from 'react'
import { deleteEvent, readEventById, registerToEvent, unregisterFromEvent, readRegisteredEvents, readEventRegistrations } from '../utils'
import { useNavigate, useParams } from 'react-router'
import { myUserContext } from '../context/MyContextProvider'
import './Event.css'
import EventMap from './EventMap'

const Event = () => {
    const { user } = useContext(myUserContext)
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImgIndex, setCurrentImgIndex] = useState(0)
    const [registered, setRegistered] = useState(false)
    const [regLoading, setRegLoading] = useState(false)
    const [regCount, setRegCount] = useState(null)
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

    useEffect(() => {
        if (!user || !event) return;
        readRegisteredEvents().then(data => {
            setRegistered(data.events.some(e => e.id === event.id));
        });
    }, [user, event]);

    // ✅ Szerverről kérdezi le a valós számot, nem lokálisan számolja
    const fetchRegCount = async (eventId) => {
        const data = await readEventRegistrations(eventId);
        setRegCount(data.count);
    };

    useEffect(() => {
        if (!event) return;
        fetchRegCount(event.id);
    }, [event]);

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
    const heroUrl = hasImages ? galleryImages[0].url : null;

    const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    const handleRegister = async () => {
        if (!user) return navigate("/signin");
        setRegLoading(true);
        if (registered) {
            await unregisterFromEvent(event.id);
            setRegistered(false);
        } else {
            await registerToEvent(event.id);
            setRegistered(true);
        }
        // ✅ Jelentkezés/leiratkozás után szerverről kéri le a friss számot
        await fetchRegCount(event.id);
        setRegLoading(false);
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
                <main className="main-card">
                    <div className="info-bar">
                        <div className="info-item">
                            <span>📍</span> {event.location || "Helyszín nincs megadva"}
                        </div>
                        <div className="info-item">
                            <span>👤</span> Szervező: {event.ownerName}
                        </div>
                        <div className="info-item">
                            <span>✅</span> Jelentkezők: {regCount !== null ? regCount : "..."}
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Esemény leírása</h3>
                        <div className="description-text">
                            {event.description}
                        </div>
                    </div>

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
                            <div className="gallery-empty">Nincs feltöltött kép!</div>
                        )}
                    </div>
                </main>

                <div className="sidebar-container">
                    

                    <aside className="sidebar-card">
                        <h3>Helyszín</h3>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='locationText'
                        >
                            {event.location}
                        </a>
                        <EventMap address={event.location} />
                    </aside>

                    <aside className="sidebar-card">
                        <div className="button-group">
                            {user?.uid !== event.ownerUid && (
                                <button
                                    className={`btn ${registered ? 'btn-delete' : 'btn-sub'}`}
                                    onClick={handleRegister}
                                    disabled={regLoading}
                                >
                                    {regLoading ? "..." : registered ? "Leiratkozás" : "Jelentkezés"}
                                </button>
                            )}
                            <button className="btn btn-sub" onClick={() => navigate("/events")}>Vissza</button>
                            {user && user.uid === event.ownerUid && (
                                <div className="owner-actions">
                                    <button
                                        className="btn btn-sub"
                                        onClick={() => navigate(`/event/${event.id}/edit`)}
                                    >
                                        Szerkesztés
                                    </button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(event)}>Törlés</button>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Event