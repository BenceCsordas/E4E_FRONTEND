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

    // --- Képlapozó beállításai ---
    const placeholders = [
        { id: 1, color: '#3b82f6', text: 'Kép 1 helye' },
        { id: 2, color: '#8b5cf6', text: 'Kép 2 helye' },
        { id: 3, color: '#ec4899', text: 'Kép 3 helye' }
    ];

    const galleryItems = (event?.imageUrl) 
        ? [{ id: 0, url: event.imageUrl }, ...placeholders] 
        : placeholders;

    const nextImage = () => {
        setCurrentImgIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const prevImage = () => {
        setCurrentImgIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    useEffect(() => {
        if (id) {
            readEventById(id, (data) => {
                setEvent(data);
                setLoading(false);
            });
        }
    }, [id])

    const handleDelete = async (ev) => {
        const ok = confirm(`Biztos törlöd? (${ev.title})`);
        if (!ok) return;

        const res = await deleteEvent(ev.id, ev.imageDeleteUrl);
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
                <img className="event-hero-img" src={event.imageUrl} alt={event.title} />
                <div className="event-hero-overlay">
                    <h1>{event.title}</h1>
                </div>
            </div>

            <div className="event-content-wrapper">
                {/* BAL OLDAL - Fő tartalom (Leírás + Galéria) */}
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

                    {/* GALÉRIA A LEÍRÁS ALATT */}
                    <div className="gallery-section">
                        <h3>Galéria</h3>
                        <div className="mini-slider">
                            {galleryItems[currentImgIndex].url ? (
                                <img 
                                    src={galleryItems[currentImgIndex].url} 
                                    className="slider-img" 
                                    alt="Esemény képe"
                                />
                            ) : (
                                <div 
                                    className="placeholder-slide"
                                    style={{ backgroundColor: galleryItems[currentImgIndex].color }}
                                >
                                    <span>{galleryItems[currentImgIndex].text}</span>
                                </div>
                            )}

                            <button className="slider-btn prev" onClick={prevImage} type="button">❮</button>
                            <button className="slider-btn next" onClick={nextImage} type="button">❯</button>
                            
                            <div className="slider-dots">
                                {galleryItems.map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`dot ${i === currentImgIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImgIndex(i)}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* JOBB OLDAL - Sidebar (Gombok + Térkép) */}
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
                        <h3><span className='locationText'>{event.location}</span></h3>
                        <EventMap address={event.location} />
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Event