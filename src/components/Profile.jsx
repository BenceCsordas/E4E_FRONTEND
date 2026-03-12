import React, { useContext, useEffect, useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'
import { readRegisteredEvents, readMyEvents, readRegistrationCounts } from '../utils'
import EventCard from './EventCard'

const Profile = () => {
  const { user, logoutUser, deleteAccount } = useContext(myUserContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('registered')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [regCounts, setRegCounts] = useState({})

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      readRegisteredEvents(),
      readMyEvents(),
      readRegistrationCounts()
    ]).then(([regData, myData, counts]) => {
      setRegisteredEvents(regData?.events || [])
      setMyEvents(myData?.events || [])
      setRegCounts(counts || {})
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

      <div className="profile-card">
        <h2 className="profile-name">{user?.displayName}</h2>
        <div className="profile-buttons">
          <button className="delete-btn" onClick={handleDelete}>Fiók törlése</button>
          <button className="logout-btn" onClick={logout}>Kijelentkezés</button>
        </div>
      </div>

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

      {loading ? (
        <div className="status">Betöltés…</div>
      ) : currentEvents.length === 0 ? (
        <div className="status">
          {activeTab === 'registered'
            ? 'Még nem jelentkeztél eseményre.'
            : 'Még nem hoztál létre eseményt.'}
        </div>
      ) : (
        <div className="eventsGrid">
          {currentEvents.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              isOwner={activeTab === 'mine'}
              setEvents={activeTab === 'mine' ? setMyEvents : setRegisteredEvents}
              regCount={regCounts[ev.id] ?? 0}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Profile