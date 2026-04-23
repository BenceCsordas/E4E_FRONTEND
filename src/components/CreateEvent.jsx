import React, { useState } from 'react'
import { addEvent } from "../utils";
import MapPicker from './MapPicker';
import './CreateEvent.css';
import { useContext } from 'react';
import { useNavigate } from 'react-router'
import { myUserContext } from '../context/MyContextProvider';
import { useMyUser } from '../context/MyContextProvider';
import Spinner from './Spinner';
const CreateEvent = () => {
  const { setMsg } = useMyUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const totalSlides = 3;

  // "2026-04-13" → "2026.04.13"
  const formatDate = (val) => val ? val.replace(/-/g, ".") : null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    const newImages = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const next = () => {
    if (currentIndex === 0) {
      if (!title.trim()) { setMsg({ warning: "A cím megadása kötelező!" }); return; }
      if (!description.trim()) { setMsg({ warning: "A leírás megadása kötelező!" }); return; }
      if (!date) { setMsg({ warning: "A dátum megadása kötelező!" }); return; }
      if (!time) { setMsg({ warning: "Az időpont megadása kötelező!" }); return; }
    }
    if (currentIndex === 1) {
      if (!address.trim()) { setMsg({ warning: "A helyszín megadása kötelező!" }); return; }
    }
    if (currentIndex < totalSlides - 1) setCurrentIndex((prev) => prev + 1);
  };

  const previous = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validációk (maradnak változatlanul)
    if (!title.trim()) { setMsg({ warning: "A cím megadása kötelező!" }); setCurrentIndex(0); return; }
    if (!description.trim()) { setMsg({ warning: "A leírás megadása kötelező!" }); setCurrentIndex(0); return; }
    if (!address.trim()) { setMsg({ warning: "A helyszín megadása kötelező!" }); setCurrentIndex(1); return; }
    if (!date) { setMsg({ warning: "A dátum megadása kötelező!" }); setCurrentIndex(1); return; }
    if (!time) { setMsg({ warning: "Az időpont megadása kötelező!" }); setCurrentIndex(1); return; }

    // Töltés indítása
    setLoading(true);

    const files = images.map((img) => img.file);

    const result = await addEvent(
      {
        title,
        address,
        description,
        date: formatDate(date) || null,
        time: time || null,
      },
      files
    );

    if (result?.ok) {
      setMsg({ success: "Sikeresen létrehoztad az eseményed: " + title });
      // Resetelések...
      setTitle("");
      setDescription("");
      setAddress("");
      setDate("");
      setTime("");
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setCurrentIndex(0);
      navigate("/profile");
    } else {
      setMsg({ err: "Hiba történt az esemény létrehozásakor" });
      // Hiba esetén újra engedélyezzük a gombot
      setLoading(false);
    }
  };

  return (
    <div className='createEvent'>
      <div className="slider-container">
        <form onSubmit={handleSubmit}>
          <div className="slider" style={{ "--index": currentIndex }}>

            {/* 1. SLIDE: Alapadatok */}
            <div className="slide">
              <h3>Alapadatok</h3>
              <input
                type="text"
                placeholder="Esemény címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Esemény rövid leírása..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="date-time-row">
                <div className="date-time-field">
                  <label className="field-label">Dátum</label>
                  <input
                    type="date"
                    className="date-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="date-time-field">
                  <label className="field-label">Időpont</label>
                  <input
                    type="time"
                    className="time-input"
                    value={time}
                    
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. SLIDE: Helyszín */}
            <div className="slide">
              <h3>Helyszín</h3>
              <MapPicker onAddressSelect={(val) => setAddress(val)} />
            </div>

            {/* 3. SLIDE: Képek */}
            <div className="slide">
              <h3>Képek feltöltése</h3>
              <input
                type="file"
                className="file"
                id="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file" className='imgUpload'>
                + Kép(ek) hozzáadása
              </label>
              {images.length > 0 ? (
                <div className="image-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className="image-thumb-wrapper">
                      <img src={img.preview} alt={`kép ${idx + 1}`} className="image-thumb" />
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => removeImage(idx)}
                        title="Kép eltávolítása"
                      >✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="placeholder-preview">Nincs kép kiválasztva</div>
              )}
              <button 
                  className='upload' 
                  type="submit" 
                  disabled={loading} // Letiltja a kattintást, ha loading true
                >
                  {loading ?  <Spinner size="sm" label={"Létrehozás folyamatban"}/> : "Esemény létrehozása"}
              </button>
            </div>
          </div>

          <div className="buttons">
            <button type="button" onClick={previous} disabled={currentIndex === 0}>
              Vissza
            </button>
            <button type="button" onClick={next} disabled={currentIndex === totalSlides - 1}>
              Tovább
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;