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
  deleteEvent,
} from '../utils';
import './AdminPanel.css';

// ─── kis segédkomponens: megerősítő modal ───────────────────────────────────
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

// ─── Email modal ─────────────────────────────────────────────────────────────
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

// ─── Rename modal ─────────────────────────────────────────────────────────────
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

// ─── Registrations drawer ────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
const AdminPanel = ({ onEditEvent }) => {
  const { setMsg } = useContext(myUserContext);

  const [section, setSection] = useState('stats'); // stats | events | users
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // modals
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'event'|'user', item }
  const [emailTarget, setEmailTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [regDrawer, setRegDrawer] = useState(null);

  // search
  const [eventSearch, setEventSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // ── loaders ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (section === 'stats') loadStats();
    if (section === 'events') loadEvents();
    if (section === 'users') loadUsers();
  }, [section]);

  const loadStats = async () => {
    setLoading(true);
    const data = await adminReadStats();
    setStats(data);
    setLoading(false);
  };

  const loadEvents = async () => {
    setLoading(true);
    const data = await adminReadAllEvents(200);
    setEvents(data?.events || []);
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminReadUsers();
    setUsers(data?.users || []);
    setLoading(false);
  };

  // ── event actions ──────────────────────────────────────────────────────────
  const handleDeleteEvent = async (ev) => {
    const res = await deleteEvent(ev.id, ev.images || []);
    if (res?.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      setMsg({ success: 'Esemény törölve.' });
    } else {
      setMsg({ err: 'Hiba történt a törlés során.' });
    }
    setConfirmDelete(null);
  };

  // ── user actions ───────────────────────────────────────────────────────────
  const handleDeleteUser = async (u) => {
    const res = await adminDeleteUser(u.uid);
    if (res?.ok) {
      setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
      setMsg({ success: `${u.name} fiókja törölve (eseményeivel együtt).` });
    } else {
      setMsg({ err: 'Hiba a törlés során.' });
    }
    setConfirmDelete(null);
  };

  const handleRenameUser = async ({ name, isAdmin }) => {
    const res = await adminUpdateUser(renameTarget.uid, { name, isAdmin });
    if (res?.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.uid === renameTarget.uid ? { ...u, name, isAdmin } : u))
      );
      setMsg({ success: 'Felhasználó frissítve.' });
    } else {
      setMsg({ err: 'Hiba a mentés során.' });
    }
    setRenameTarget(null);
  };

  const handleSendEmail = async ({ subject, message }) => {
    const res = await adminSendEmail(emailTarget.uid, { subject, message });
    if (res?.ok) setMsg({ success: 'Email elküldve.' });
    else setMsg({ err: 'Email küldési hiba.' });
    setEmailTarget(null);
  };

  // ── filtered lists ─────────────────────────────────────────────────────────
  const filteredEvents = events.filter(
    (e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.ownerName?.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="adm-root">
      {/* ── Nav pills ── */}
      <div className="adm-nav">
        {[
          { key: 'stats', label: 'Dashboard' },
          { key: 'events', label: 'Események' },
          { key: 'users', label: 'Felhasználók' },
        ].map((s) => (
          <button
            key={s.key}
            className={`adm-nav-pill ${section === s.key ? 'active' : ''}`}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && <div className="adm-loading"><span className="adm-spinner" /></div>}

      {/* ══ STATS ══════════════════════════════════════════════════════════ */}
      {!loading && section === 'stats' && stats && (
        <div className="adm-stats-grid">
          <StatCard  label="Felhasználók" value={stats.totalUsers} color="blue" />
          <StatCard  label="Események" value={stats.totalEvents} color="purple" />
          <StatCard  label="Jelentkezések" value={stats.totalRegistrations} color="green" />
          {stats.recentEvents?.length > 0 && (
            <div className="adm-stat-card adm-recent-events" style={{ '--c': 'var(--adm-amber)' }}>
              <div className="adm-stat-label">🕒 Legutóbbi események</div>
              <ul className="adm-recent-list">
                {stats.recentEvents.slice(0, 5).map((e) => (
                  <li key={e.id}>
                    <span className="adm-recent-title">{e.title}</span>
                    <span className="adm-recent-owner">{e.ownerName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ══ EVENTS ═════════════════════════════════════════════════════════ */}
      {!loading && section === 'events' && (
        <>
          <div className="adm-toolbar">
            <input
              className="adm-search"
              placeholder="🔍 Keresés cím, szervező..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
            />
            <span className="adm-count">{filteredEvents.length} esemény</span>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Cím</th>
                  <th>Szervező</th>
                  <th>Dátum</th>
                  <th>Helyszín</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan={5} className="adm-empty">Nincs találat.</td></tr>
                ) : filteredEvents.map((ev) => (
                  <tr key={ev.id} className="adm-tr">
                    <td className="adm-td-title">
                      {ev.images?.[0]?.url && (
                        <img className="adm-thumb" src={ev.images[0].url} alt="" />
                      )}
                      <span>{ev.title}</span>
                    </td>
                    <td className="adm-muted-cell">{ev.ownerName || '—'}</td>
                    <td className="adm-muted-cell">{ev.datetime || ev.date || '—'}</td>
                    <td className="adm-muted-cell adm-location">{ev.location || '—'}</td>
                    <td>
                      <div className="adm-actions">
                        <button
                          className="adm-action-btn adm-action-info"
                          title="Jelentkezők"
                          onClick={() => setRegDrawer(ev)}
                        >
                          👥
                        </button>
                        <button
                          className="adm-action-btn adm-action-edit"
                          title="Szerkesztés"
                          onClick={() => onEditEvent(ev)}
                        >
                          ✏️
                        </button>
                        <button
                          className="adm-action-btn adm-action-del"
                          title="Törlés"
                          onClick={() => setConfirmDelete({ type: 'event', item: ev })}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══ USERS ══════════════════════════════════════════════════════════ */}
      {!loading && section === 'users' && (
  <>
    <div className="adm-toolbar">
      <input
        className="adm-search"
        placeholder="🔍 Keresés név, email..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />
      <span className="adm-count">{filteredUsers.length} felhasználó</span>
    </div>
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Név</th>
            <th>Email</th>
            <th>Regisztráció</th>
            <th>Jogosultság</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr><td colSpan={5} className="adm-empty">Nincs találat.</td></tr>
          ) : filteredUsers.map((u) => (
            <tr key={u.uid} className="adm-tr">
              <td className="adm-td-name">
                {/* ── Itt történt a módosítás: avatár megjelenítése ── */}
                <div className="adm-avatar">
                  <img 
                    src={u.photoURL || 'https://placehold.net/avatar.svg'} 
                    alt={u.name || 'User'} 
                    onError={(e) => { e.target.src = 'https://placehold.net/avatar.svg'; }}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
                <span>{u.name || '—'}</span>
              </td>
              <td className="adm-muted-cell">{u.email || '—'}</td>
              <td className="adm-muted-cell">
                {u.createdAt?.seconds
                  ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('hu-HU')
                  : '—'}
              </td>
              <td>
                <span className={`adm-badge ${u.isAdmin ? 'adm-badge-admin' : 'adm-badge-user'}`}>
                  {u.isAdmin ? 'Admin' : 'User'}
                </span>
              </td>
              <td>
                <div className="adm-actions">
                  <button
                    className="adm-action-btn adm-action-email"
                    title="Email küldése"
                    onClick={() => setEmailTarget(u)}
                  >
                    📧
                  </button>
                  <button
                    className="adm-action-btn adm-action-edit"
                    title="Szerkesztés"
                    onClick={() => setRenameTarget(u)}
                  >
                    ✏️
                  </button>
                  <button
                    className="adm-action-btn adm-action-del"
                    title="Törlés"
                    onClick={() => setConfirmDelete({ type: 'user', item: u })}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

      {/* ── Modals ── */}
      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.type === 'event'
              ? `Biztosan törlöd a(z) "${confirmDelete.item.title}" eseményt?`
              : `Biztosan törlöd ${confirmDelete.item.name} fiókját? (összes eseményével együtt!)`
          }
          onConfirm={() =>
            confirmDelete.type === 'event'
              ? handleDeleteEvent(confirmDelete.item)
              : handleDeleteUser(confirmDelete.item)
          }
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {emailTarget && (
        <EmailModal
          user={emailTarget}
          onSend={handleSendEmail}
          onCancel={() => setEmailTarget(null)}
        />
      )}
      {renameTarget && (
        <RenameModal
          user={renameTarget}
          onSave={handleRenameUser}
          onCancel={() => setRenameTarget(null)}
        />
      )}
      {regDrawer && (
        <RegDrawer
          event={regDrawer}
          onClose={() => setRegDrawer(null)}
        />
      )}
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const colorMap = {
  blue: 'var(--adm-blue)',
  purple: 'var(--adm-purple)',
  green: 'var(--adm-green)',
  amber: 'var(--adm-amber)',
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="adm-stat-card" style={{ '--c': colorMap[color] }}>
    <div className="adm-stat-icon">{icon}</div>
    <div className="adm-stat-value">{value ?? '—'}</div>
    <div className="adm-stat-label">{label}</div>
  </div>
);

export default AdminPanel;