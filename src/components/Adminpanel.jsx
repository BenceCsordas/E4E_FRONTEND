import React, { useState, useEffect, useContext } from 'react';
import { myUserContext } from '../context/MyContextProvider';
import {
  adminReadUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminSendEmail,
  adminReadStats,
  adminReadAllEvents,
  readEventRegistrations,
  adminDeleteEvent,
  adminUpdateEvent,
} from '../utils';
import './AdminPanel.css';

// ─── MODAL: Megerősítés ──────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="adm-overlay" onClick={onCancel}>
    <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <div className="adm-modal-btns">
        <button className="adm-btn adm-btn-danger" onClick={onConfirm}>Törlés</button>
        <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Mégsem</button>
      </div>
    </div>
  </div>
);

// ─── MODAL: Email küldése ────────────────────────────────────────────────────
const EmailModal = ({ user, onSend, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-modal adm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h4 className="adm-modal-title">Email küldése — <span>{user.name}</span></h4>
        <input
          className="adm-input"
          placeholder="Tárgy"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="adm-input adm-textarea"
          placeholder="Üzenet..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="adm-modal-btns">
          <button
            className="adm-btn adm-btn-primary"
            onClick={() => onSend({ subject, message })}
            disabled={!subject.trim() || !message.trim()}
          >
            Küldés
          </button>
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Mégsem</button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL: Felhasználó szerkesztése ─────────────────────────────────────────
const RenameModal = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name || '');
  const [isAdmin, setIsAdmin] = useState(user.isAdmin || false);
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <h4 className="adm-modal-title">Felhasználó szerkesztése</h4>
        <input
          className="adm-input"
          placeholder="Név"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="adm-checkbox-label">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Admin jogosultság
        </label>
        <div className="adm-modal-btns">
          <button
            className="adm-btn adm-btn-primary"
            onClick={() => onSave({ name, isAdmin })}
            disabled={!name.trim()}
          >
            Mentés
          </button>
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Mégsem</button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL: Esemény szerkesztése ─────────────────────────────────────────────
const EditEventModal = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event.title || '',
    location: event.location || '',
    datetime: event.datetime || event.date || '',
    description: event.description || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-modal adm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h4 className="adm-modal-title">Esemény szerkesztése</h4>
        <input name="title" className="adm-input" placeholder="Cím" value={formData.title} onChange={handleChange} />
        <input name="location" className="adm-input" placeholder="Helyszín" value={formData.location} onChange={handleChange} />
        <input name="datetime" className="adm-input" placeholder="Dátum/Időpont" value={formData.datetime} onChange={handleChange} />
        <textarea name="description" className="adm-input adm-textarea" placeholder="Leírás" value={formData.description} onChange={handleChange} />
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-primary" onClick={() => onSave(formData)}>Mentés</button>
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Mégsem</button>
        </div>
      </div>
    </div>
  );
};

// ─── DRAWER: Jelentkezők listája ─────────────────────────────────────────────
const RegDrawer = ({ event, onClose }) => {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readEventRegistrations(event.id).then((data) => {
      setRegs(data?.registrations || []);
      setLoading(false);
    });
  }, [event.id]);

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="adm-drawer-header">
          <h4>{event.title} — Jelentkezők</h4>
          <button className="adm-close-btn" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <p className="adm-muted">Betöltés…</p>
        ) : regs.length === 0 ? (
          <p className="adm-muted">Nincs jelentkező.</p>
        ) : (
          <ul className="adm-reg-list">
            {regs.map((r) => (
              <li key={r.id} className="adm-reg-item">
                <span className="adm-reg-name">{r.userName || '—'}</span>
                <span className="adm-reg-email">{r.userEmail || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ─── SEGÉD: Statisztikai kártya ──────────────────────────────────────────────
const StatCard = ({ label, value, color }) => {
  const colorMap = {
    blue: 'var(--adm-blue)',
    purple: 'var(--adm-purple)',
    green: 'var(--adm-green)',
    amber: 'var(--adm-amber)',
  };
  return (
    <div className="adm-stat-card" style={{ '--c': colorMap[color] }}>
      <div className="adm-stat-value">{value ?? '—'}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  const { setMsg } = useContext(myUserContext);
  const [section, setSection] = useState('stats'); 
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null); 
  const [emailTarget, setEmailTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [regDrawer, setRegDrawer] = useState(null);
  const [editEventTarget, setEditEventTarget] = useState(null);

  const [eventSearch, setEventSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (section === 'stats') loadStats();
    if (section === 'events') loadEvents();
    if (section === 'users') loadUsers();
  }, [section]);

  const loadStats = async () => { setLoading(true); const data = await adminReadStats(); setStats(data); setLoading(false); };
  const loadEvents = async () => { setLoading(true); const data = await adminReadAllEvents(200); setEvents(data?.events || []); setLoading(false); };
  const loadUsers = async () => { setLoading(true); const data = await adminReadUsers(); setUsers(data?.users || []); setLoading(false); };

  const handleDeleteEvent = async (ev) => {
    const res = await adminDeleteEvent(ev.id, ev.images || []);
    if (res?.ok) { setEvents(prev => prev.filter(e => e.id !== ev.id)); setMsg({ success: 'Esemény törölve.' }); }
    else setMsg({ err: 'Hiba a törlés során.' });
    setConfirmDelete(null);
  };

  const handleUpdateEvent = async (updatedData) => {
    const res = await adminUpdateEvent(editEventTarget.id, updatedData);
    if (res?.ok) { setEvents(prev => prev.map(e => e.id === editEventTarget.id ? { ...e, ...updatedData } : e)); setMsg({ success: 'Esemény frissítve.' }); }
    else setMsg({ err: 'Hiba a mentés során.' });
    setEditEventTarget(null);
  };

  const handleDeleteUser = async (u) => {
    const res = await adminDeleteUser(u.uid);
    if (res?.ok) { setUsers(prev => prev.filter(x => x.uid !== u.uid)); setMsg({ success: 'Felhasználó törölve.' }); }
    else setMsg({ err: 'Hiba a törlés során.' });
    setConfirmDelete(null);
  };

  const handleRenameUser = async ({ name, isAdmin }) => {
    const res = await adminUpdateUser(renameTarget.uid, { name, isAdmin });
    if (res?.ok) { setUsers(prev => prev.map(u => u.uid === renameTarget.uid ? { ...u, name, isAdmin } : u)); setMsg({ success: 'Adatok frissítve.' }); }
    else setMsg({ err: 'Hiba a mentés során.' });
    setRenameTarget(null);
  };

  const handleSendEmail = async ({ subject, message }) => {
    const res = await adminSendEmail(emailTarget.uid, { subject, message });
    if (res?.ok) setMsg({ success: 'Email elküldve.' }); else setMsg({ err: 'Hiba.' });
    setEmailTarget(null);
  };

  const filteredEvents = events.filter(e => e.title?.toLowerCase().includes(eventSearch.toLowerCase()) || e.ownerName?.toLowerCase().includes(eventSearch.toLowerCase()));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="adm-root">
      <div className="adm-nav">
        {[{ key: 'stats', label: 'Dashboard' }, { key: 'events', label: 'Események' }, { key: 'users', label: 'Felhasználók' }].map(s => (
          <button key={s.key} className={`adm-nav-pill ${section === s.key ? 'active' : ''}`} onClick={() => setSection(s.key)}>{s.label}</button>
        ))}
      </div>

      {loading && <div className="adm-loading"><span className="adm-spinner" /></div>}

      {!loading && section === 'stats' && stats && (
        <div className="adm-stats-grid">
          <StatCard label="Felhasználók" value={stats.totalUsers} color="blue" />
          <StatCard label="Események" value={stats.totalEvents} color="purple" />
          <StatCard label="Jelentkezések" value={stats.totalRegistrations} color="green" />
          <div className="adm-stat-card adm-recent-events" style={{ '--c': 'var(--adm-amber)' }}>
            <div className="adm-stat-label">🕒 Legutóbbi események</div>
            <ul className="adm-recent-list">
              {stats.recentEvents?.slice(0, 5).map(e => (
                <li key={e.id}><span className="adm-recent-title">{e.title}</span><span className="adm-recent-owner">{e.ownerName}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && section === 'events' && (
        <>
          <div className="adm-toolbar">
            <input className="adm-search" placeholder="🔍 Keresés..." value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
          </div>
          <span className="adm-count">{filteredEvents.length} esemény</span>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Cím</th><th>Szervező</th><th>Dátum</th><th>Helyszín</th><th>Műveletek</th></tr></thead>
              <tbody>
                {filteredEvents.map(ev => (
                  <tr key={ev.id} className="adm-tr">
                    <td className="adm-td-title">{ev.images?.[0]?.url && <img className="adm-thumb" src={ev.images[0].url} alt="" />}<span>{ev.title}</span></td>
                    <td className="adm-muted-cell">{ev.ownerName || '—'}</td>
                    <td className="adm-muted-cell">{ev.datetime || ev.date || '—'}</td>
                    <td className="adm-muted-cell adm-location">{ev.location || '—'}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn adm-action-info" onClick={() => setRegDrawer(ev)}>👥</button>
                        <button className="adm-action-btn adm-action-edit" onClick={() => setEditEventTarget(ev)}>✏️</button>
                        <button className="adm-action-btn adm-action-del" onClick={() => setConfirmDelete({ type: 'event', item: ev })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && section === 'users' && (
        <>
          <div className="adm-toolbar">
            <input className="adm-search" placeholder="🔍 Keresés..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          </div>
          <span className="adm-count">{filteredUsers.length} felhasználó</span>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Név</th><th>Email</th><th>Regisztráció</th><th>Jogosultság</th><th>Műveletek</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="adm-tr">
                    <td className="adm-td-name">
                      <div className="adm-avatar">
                        <img src={u.photoURL || 'https://placehold.net/avatar.svg'} alt="" onError={e => e.target.src = 'https://placehold.net/avatar.svg'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <span>{u.name || '—'}</span>
                    </td>
                    <td className="adm-muted-cell">{u.email || '—'}</td>
                    <td className="adm-muted-cell">{u.createdAt ? (u.createdAt.toDate ? u.createdAt.toDate().toLocaleDateString('hu-HU') : new Date((u.createdAt.seconds || u.createdAt._seconds) * 1000).toLocaleDateString('hu-HU')) : '—'}</td>
                    <td><span className={`adm-badge ${u.isAdmin ? 'adm-badge-admin' : 'adm-badge-user'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                    <td>
                      <div className="adm-actions">
                        
                        <button className="adm-action-btn adm-action-edit" onClick={() => setRenameTarget(u)}>✏️</button>
                        <button className="adm-action-btn adm-action-del" onClick={() => setConfirmDelete({ type: 'user', item: u })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {confirmDelete && <ConfirmModal message={confirmDelete.type === 'event' ? `Biztos törlöd a(z) "${confirmDelete.item.title}" eseményt?` : `Biztos törlöd ${confirmDelete.item.name} fiókját?`} onConfirm={() => confirmDelete.type === 'event' ? handleDeleteEvent(confirmDelete.item) : handleDeleteUser(confirmDelete.item)} onCancel={() => setConfirmDelete(null)} />}
      {emailTarget && <EmailModal user={emailTarget} onSend={handleSendEmail} onCancel={() => setEmailTarget(null)} />}
      {renameTarget && <RenameModal user={renameTarget} onSave={handleRenameUser} onCancel={() => setRenameTarget(null)} />}
      {editEventTarget && <EditEventModal event={editEventTarget} onSave={handleUpdateEvent} onCancel={() => setEditEventTarget(null)} />}
      {regDrawer && <RegDrawer event={regDrawer} onClose={() => setRegDrawer(null)} />}
    </div>
  );
};

export default AdminPanel;