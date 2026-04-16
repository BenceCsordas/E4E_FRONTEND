import React, { useContext, useEffect, useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'
import { readRegisteredEvents, readMyEvents, readRegistrationCounts, readMe } from '../utils'
import EventCard from './EventCard'
import AdminPanel from './AdminPanel'
// import EditEvent from './EditEvent'   ← a te meglévő EditEvent komponensed

const Profile = () => {
  const { user, logoutUser, deleteAccount, msg, showToast } = useContext(myUserContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('registered')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [regCounts, setRegCounts] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null) // admin → edit

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      readRegisteredEvents(),
      readMyEvents(),
      readRegistrationCounts(),
      readMe(), // isAdmin flag lekérése
    ]).then(([regData, myData, counts, meData]) => {
      setRegisteredEvents(regData?.events || [])
      setMyEvents(myData?.events || [])
      setRegCounts(counts || {})
      setIsAdmin(meData?.isAdmin === true)
      setLoading(false)
    })
  }, [user])

  const logout = () => {
    logoutUser()
    navigate('/')
  }

  const handleDelete = async () => {
    if (window.confirm('Biztosan törölni akarja fiókját?')) {
      const pw = prompt('Add meg a jelszavad a fiók törléséhez: ')
      await deleteAccount(pw)
      navigate('/')
    }
  }

  // Ha az admin az edit gombra kattint, megnyitjuk az EditEvent-et
  const handleAdminEditEvent = (ev) => {
    setEditingEvent(ev)
    // Ha az EditEvent külön route-on van, navigate helyett:
    // navigate(`/edit-event/${ev.id}`)
  }

  const currentEvents =
    activeTab === 'registered' ? registeredEvents : myEvents

  // Ha épp editálunk admin módból, megjelenítjük az EditEvent-et
  // (A te EditEvent komponensedhez igazítsd az interface-t!)
  if (editingEvent) {
    return (
      <div className="profile-page">

        <button
          className="btn btn-sub"
          style={{ margin: '20px auto', display: 'block', width: 'fit-content' }}
          onClick={() => setEditingEvent(null)}
        >
          ← Vissza az Admin panelre
        </button>
        {/* <EditEvent event={editingEvent} onDone={() => setEditingEvent(null)} /> */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          [EditEvent komponens helye — eventId: {editingEvent.id}]
        </p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-name">{user?.displayName}</h2>
        {isAdmin && (
          <span className="profile-admin-badge">Admin</span>
        )}
        <div className="profile-buttons">
          <button className="btn btn-sub" onClick={logout}>Kijelentkezés</button>
          <button className="btn btn-delete" onClick={handleDelete}>Fiók törlése</button>
        </div>
      </div>

      {/* ── Tabs ── */}
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
        {isAdmin && (
          <button
            className={`profile-tab profile-tab-admin ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {activeTab === 'admin' && isAdmin ? (
        <AdminPanel onEditEvent={handleAdminEditEvent} />
      ) : loading ? (
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
              regCount={regCounts[ev.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile