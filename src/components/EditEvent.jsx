import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { myUserContext } from '../context/MyContextProvider'
import { readEventById, updateEvent } from '../utils'
import './EditEvent.css'

const EditEvent = () => {
    const { user, setMsg } = useContext(myUserContext)
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
    const [existingImages, setExistingImages] = useState([])
    const [removedImages, setRemovedImages] = useState([])
    const [newFiles, setNewFiles] = useState([])
    const [newPreviews, setNewPreviews] = useState([])

    const fileInputRef = useRef()

    useEffect(() => {
        if (id) {
            readEventById(id, (data) => {
                setEvent(data)
                setTitle(data.title || '')
                setLocation(data.location || '')
                setDescription(data.description || '')

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

        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => {
                setNewPreviews(prev => [...prev, { name: file.name, preview: ev.target.result }])
            }
            reader.readAsDataURL(file)
        })

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
            setMsg({success: "Sikeres szerkesztés!"})
        } else {
            setMsg({err: "Nem sikerült menteni. Próbáld újra!"})
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

            <div className="event-content-wrapper edit-centered-wrapper">
                <main className="main-card edit-main-card">

                    {error && (
                        <div className="edit-error">{error}</div>
                    )}

                    {/* Cím */}
                    <div className="edit-field">
                        <label className="edit-label">Cím *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Esemény neve"
                            className="edit-input"
                        />
                    </div>

                    {/* Helyszín */}
                    <div className="edit-field">
                        <label className="edit-label">Helyszín</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="pl. Budapest, Deák Ferenc tér"
                            className="edit-input"
                        />
                    </div>

                    {/* Leírás */}
                    <div className="edit-field">
                        <label className="edit-label">Leírás</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Esemény részletes leírása..."
                            rows={5}
                            className="edit-textarea"
                        />
                    </div>

                    {/* Képek kezelése */}
                    <div className="edit-images-section">
                        <label className="edit-label">Képek ({totalImages} db)</label>

                        {/* Meglévő képek */}
                        {existingImages.length > 0 && (
                            <div>
                                <p className="edit-images-subtitle">Jelenlegi képek:</p>
                                <div className="edit-thumb-grid">
                                    {existingImages.map((img, i) => (
                                        <div key={i} className="edit-thumb-container">
                                            <img src={img.url} alt={`kép ${i + 1}`} className="edit-thumb-img" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExisting(img)}
                                                className="edit-thumb-remove"
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
                            <div>
                                <p className="edit-images-subtitle">Új képek (feltöltésre vár):</p>
                                <div className="edit-thumb-grid">
                                    {newPreviews.map((p, i) => (
                                        <div key={i} className="edit-thumb-container">
                                            <img src={p.preview} alt={p.name} className="edit-thumb-img" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNew(i)}
                                                className="edit-thumb-remove"
                                                title="Kép eltávolítása"
                                            >
                                                ✕
                                            </button>
                                            <div className="edit-thumb-badge">Új</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fájl feltöltő */}
                        <label className="edit-upload-label">
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
                    <div className="edit-actions">
                        <button
                            type="button"
                            onClick={() => navigate(`/event/${id}`)}
                            className="btn btn-sub"
                            disabled={saving}
                        >
                            Mégse
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="btn btn-save"
                        >
                            {saving ? 'Mentés...' : 'Mentés'}
                        </button>
                        
                    </div>
                </main>
            </div>
        </div>
    )
}

export default EditEvent