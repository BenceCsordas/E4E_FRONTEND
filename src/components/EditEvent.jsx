import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { myUserContext } from '../context/MyContextProvider'
import { readEventById, updateEvent } from '../utils'

const EditEvent = () => {
    const { user } = useContext(myUserContext)
    const { id } = useParams()
    const navigate = useNavigate()

    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    // Form fields
    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('')
    const [description, setDescription] = useState('')

    // Images
    const [existingImages, setExistingImages] = useState([])   // [{ url, delete_url }]
    const [removedImages, setRemovedImages] = useState([])     // képek amiket törlünk
    const [newFiles, setNewFiles] = useState([])               // File[] - újonnan hozzáadott képek
    const [newPreviews, setNewPreviews] = useState([])         // base64 preview az új képekhez

    const fileInputRef = useRef()

    useEffect(() => {
        if (id) {
            readEventById(id, (data) => {
                setEvent(data)
                setTitle(data.title || '')
                setLocation(data.location || '')
                setDescription(data.description || '')

                // Képek betöltése - támogatja mind a régi (imageUrl) mind az új (images[]) formátumot
                if (Array.isArray(data.images) && data.images.length > 0) {
                    setExistingImages(data.images)
                } else if (data.imageUrl) {
                    setExistingImages([{ url: data.imageUrl, delete_url: data.imageDeleteUrl || null }])
                } else {
                    setExistingImages([])
                }

                setLoading(false)
            })
        }
    }, [id])

    // Ha nem a tulajdonos, visszairányítjuk
    useEffect(() => {
        if (!loading && event && user && user.uid !== event.ownerUid) {
            navigate(`/event/${id}`)
        }
    }, [loading, event, user])

    const handleRemoveExisting = (img) => {
        setExistingImages(prev => prev.filter(i => i.url !== img.url))
        setRemovedImages(prev => [...prev, img])
    }

    const handleNewFiles = (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        setNewFiles(prev => [...prev, ...files])

        // Preview generálás
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => {
                setNewPreviews(prev => [...prev, { name: file.name, preview: ev.target.result }])
            }
            reader.readAsDataURL(file)
        })

        // Reset input hogy ugyanazt a fájlt újra lehessen választani
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemoveNew = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
        setNewPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('A cím kötelező!')
            return
        }
        setSaving(true)
        setError(null)

        const updateData = {
            title,
            location,
            description,
            images: existingImages,
        }

        const res = await updateEvent(id, updateData, newFiles, removedImages)

        setSaving(false)

        if (res?.ok) {
            navigate(`/event/${id}`)
        } else {
            setError('Nem sikerült menteni. Próbáld újra!')
        }
    }

    if (loading) return <div className="loading">Betöltés...</div>
    if (!event) return <div className="loading">Esemény nem található.</div>

    const totalImages = existingImages.length + newFiles.length

    return (
        <div className="event-container">
            <div className="event-hero">
                <div className="event-hero-placeholder" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
                <div className="event-hero-overlay">
                    <h1>Esemény szerkesztése</h1>
                </div>
            </div>

            <div className="event-content-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                <main className="main-card" style={{ maxWidth: 700, width: '100%' }}>

                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#dc2626',
                            padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                            border: '1px solid #fca5a5'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Cím */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                            Cím *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Esemény neve"
                            style={inputStyle}
                        />
                    </div>

                    {/* Helyszín */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                            Helyszín
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="pl. Budapest, Deák Ferenc tér"
                            style={inputStyle}
                        />
                    </div>

                    {/* Leírás */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                            Leírás
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Esemény részletes leírása..."
                            rows={5}
                            style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                        />
                    </div>

                    {/* Képek kezelése */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, color: '#374151' }}>
                            Képek ({totalImages} db)
                        </label>

                        {/* Meglévő képek */}
                        {existingImages.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Jelenlegi képek:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {existingImages.map((img, i) => (
                                        <div key={i} style={thumbContainer}>
                                            <img src={img.url} alt={`kép ${i + 1}`} style={thumbImg} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExisting(img)}
                                                style={removeBtn}
                                                title="Kép eltávolítása"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Új képek preview */}
                        {newPreviews.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Új képek (feltöltésre vár):</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {newPreviews.map((p, i) => (
                                        <div key={i} style={thumbContainer}>
                                            <img src={p.preview} alt={p.name} style={thumbImg} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNew(i)}
                                                style={removeBtn}
                                                title="Kép eltávolítása"
                                            >
                                                ✕
                                            </button>
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'rgba(0,0,0,0.55)', color: '#fff',
                                                fontSize: 10, padding: '2px 4px',
                                                borderRadius: '0 0 6px 6px',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                Új
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fájl feltöltő */}
                        <label style={uploadLabel}>
                            <span style={{ fontSize: 22 }}>📷</span>
                            <span>Képek hozzáadása</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleNewFiles}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {/* Gombok */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="btn btn-sub"
                            style={{ minWidth: 120 }}
                        >
                            {saving ? 'Mentés...' : '💾 Mentés'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/event/${id}`)}
                            className="btn btn-sub"
                            disabled={saving}
                        >
                            Mégse
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

// --- Stílusok ---
const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #d1d5db',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
}

const thumbContainer = {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
}

const thumbImg = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
}

const removeBtn = {
    position: 'absolute',
    top: 3,
    right: 3,
    background: 'rgba(220,38,38,0.85)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 22,
    height: 22,
    cursor: 'pointer',
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
}

const uploadLabel = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    background: '#f3f4f6',
    border: '2px dashed #9ca3af',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#374151',
    fontWeight: 500,
    transition: 'background 0.2s',
}

export default EditEvent