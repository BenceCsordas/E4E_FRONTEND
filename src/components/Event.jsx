import React, { useContext, useEffect, useState } from 'react'
import { readEventById } from '../utils'
import { useNavigate, useParams } from 'react-router'
import { myUserContext } from '../context/MyContextProvider'
import './Event.css'

const Event = () => {
    const {user} = useContext(myUserContext)
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const {id} = useParams()
    console.log(user)
    console.log(event)
    useEffect(()=>{
        if(id) {
            readEventById(id, (data) => {
                setEvent(data);
                setLoading(false);
            });
        }
    },[id])

    if(loading) return <div className="loading">Betöltés...</div>
    if(!event) return <div>Esemény nem található.</div>

    
    return (
        <div className="event-container">
            <div className="event-hero">
                <button className="back-btn" onClick={()=>navigate("/events")}>Vissza</button>
                <img className="event-hero-img" src={event.imageUrl} alt={event.title} />
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
                    </div>

                    <div className="description-section">
                        <h3>Esemény leírása</h3>
                        <div className="description-text">
                            {event.description}
                        </div>
                    </div>
                </main>

               {user && user.uid == event.ownerUid && <aside className="sidebar-card">
                    <h4>Műveletek</h4>
                    <div className="button-group">
                        <button className="btn btn-edit">Szerkesztés</button>
                        <button className="btn btn-delete">Törlés</button>
                    </div>
                </aside>}
            </div>
        </div>
    )
}

export default Event