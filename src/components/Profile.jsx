import React, { useContext, useEffect, useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'
import { readRegisteredEvents, readMyEvents } from '../utils'
import EventCard from './EventCard'

const Profile = () => {
  const { user, logoutUser, deleteAccount } = useContext(myUserContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('registered') // 'registered' | 'mine'
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      readRegisteredEvents(),
      readMyEvents()
    ]).then(([regData, myData]) => {
      setRegisteredEvents(regData?.events || [])
      setMyEvents(myData?.events || [])
      setLoading(false)
    })
  }, [user])

  const logout = () => {
    logoutUser()
    navigate("/")
  }

  const handleDelete = async () => {
    if (window.confirm("Biztosan törölni akarja fiókját?")) {
      const pw = prompt("Add meg a jelszavad a fiók törléséhez: ")
      await deleteAccount(pw)
      navigate("/")
    }
  }

  const currentEvents = activeTab === 'registered' ? registeredEvents : myEvents

  return (
    <div className="profile-page">

      {/* Profil kártya */}
      <div className="profile-card">
        <h2 className="profile-name">{user?.displayName}</h2>
        <div className="profile-buttons">
          <button className="btn btn-sub" onClick={handleDelete}>Fiók törlése</button>
          <button className="btn btn-delete" onClick={logout}>Kijelentkezés</button>
        </div>
      </div>

      {/* Tab választó */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          Jelentkezett események
          {registeredEvents.length > 0 && (
            <span className="tab-badge">{registeredEvents.length}</span>
          )}
        </button>
        <button
          className={`profile-tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          Saját események
          {myEvents.length > 0 && (
            <span className="tab-badge">{myEvents.length}</span>
          )}
        </button>
      </div>

      {/* Esemény grid */}
      {loading ? (
        <div className="status">Betöltés…</div>
      ) : currentEvents.length === 0 ? (
        <div className="status">
          {activeTab === 'registered'
            ? 'Még nem jelentkeztél eseményre.'
            : 'Még nem hoztál létre eseményt.'}
        </div>
      ) : (
        <div className="eventsGridProfile eventsGrid">
          {currentEvents.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              isOwner={activeTab === 'mine'}
              setEvents={activeTab === 'mine' ? setMyEvents : setRegisteredEvents}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Profile