import React, { useContext, useEffect, useState, useRef } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'
import { 
  readRegisteredEvents, 
  readMyEvents, 
  readRegistrationCounts, 
  readMe,
  uploadProfileImage,
  updateMe 
} from '../utils'
import EventCard from './EventCard'
import AdminPanel from './AdminPanel'

const Profile = () => {
  const { user, logoutUser, deleteAccount, showToast } = useContext(myUserContext)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('registered')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [regCounts, setRegCounts] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  
  const [profilePic, setProfilePic] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      readRegisteredEvents(),
      readMyEvents(),
      readRegistrationCounts(),
      readMe(),
    ]).then(([regData, myData, counts, meData]) => {
      setRegisteredEvents(regData?.events || [])
      setMyEvents(myData?.events || [])
      setRegCounts(counts || {})
      setIsAdmin(meData?.isAdmin === true)
      setProfilePic(meData?.photoURL || null)
      setLoading(false)
    })
    console.log(user)
  }, [user])

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadProfileImage(file)
      if (result && result.url) {
        setProfilePic(result.url)
        await updateMe({ photoURL: result.url })
        showToast("success", "Siker!", "Profilkép frissítve!")
      } else {
        showToast("error", "Hiba a feltöltésnél!", "error")
      }
    } catch (error) {
      showToast("error", "Váratlan hiba!", "error")
    } finally {
      setUploading(false)
      e.target.value = null
    }
  }

  const logout = () => { logoutUser(); navigate('/'); }
  
  const handleDelete = async () => {
    if (window.confirm('Biztosan törölni akarja fiókját?')) {
      const pw = prompt('Add meg a jelszavad a törléshez:')
      await deleteAccount(pw)
      navigate('/')
    }
  }

  if (editingEvent) {
    return (
      <div className="profile-page">
        <button className="btn btn-sub" onClick={() => setEditingEvent(null)}>← Vissza</button>
        <p style={{textAlign:'center', marginTop:'20px'}}>Szerkesztés: {editingEvent.title}</p>
      </div>
    )
  }

  const currentEvents = activeTab === 'registered' ? registeredEvents : myEvents

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className='profileNI'>
          <div>
              <h2 className="profile-name">{user?.displayName}</h2>
              {isAdmin && <span className="profile-admin-badge">Admin</span>}
          </div>
        {/* Kicsi profilkép szekció */}
        <div 
          className="profile-avatar-selector"
          onClick={() => !uploading && fileInputRef.current.click()}
        >
              <img 
                src={profilePic || 'https://placehold.net/avatar.svg'} 
                alt="Avatar" 
                className={`avatar-img ${uploading ? 'uploading-blur' : ''}`}
              />
              <div className="avatar-overlay">{uploading ? '...' : 'Váltás'}</div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePicChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
        </div>
        </div>
      
        
        <div className="profile-buttons">
          <button className="btn btn-sub" onClick={logout}>Kijelentkezés</button>
          <button className="btn btn-delete" onClick={handleDelete}>Fiók törlése</button>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'registered' ? 'active' : ''}`} onClick={() => setActiveTab('registered')}>
          Jelentkezett események {registeredEvents.length > 0 && <span className="tab-badge">{registeredEvents.length}</span>}
        </button>
        <button className={`profile-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
          Saját események {myEvents.length > 0 && <span className="tab-badge">{myEvents.length}</span>}
        </button>
        {isAdmin && (
          <button className={`profile-tab profile-tab-admin ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            Admin
          </button>
        )}
      </div>

      {activeTab === 'admin' && isAdmin ? (
        <AdminPanel onEditEvent={(ev) => setEditingEvent(ev)} />
      ) : loading ? (
        <div className="status">Betöltés…</div>
      ) : (
        <div className="eventsGridProfile eventsGrid">
          {currentEvents.map((ev) => (
            <EventCard key={ev.id} ev={ev} isOwner={activeTab === 'mine'} setEvents={activeTab === 'mine' ? setMyEvents : setRegisteredEvents} regCount={regCounts[ev.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile