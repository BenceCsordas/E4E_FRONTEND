import React, { useState } from 'react'
import { addEvent } from "../utils";
import MapPicker from './MapPicker';
import './CreateEvent.css'; // Ne felejtsd el importálni a CSS-t

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0)
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  
  // Mivel összevontuk a címet és a leírást, már csak 3 slide maradt
  const totalSlides = 3 

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  }

  const next = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const previous = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addEvent(
      { title, address, description }, 
      file
    );

    if (result?.ok) {
      alert("Sikeres létrehozás!");
      setTitle("");
      setLocation("");
      setDescription("");
      setAddress("")
      setFile(null);
      setPreview(null);
      setCurrentIndex(0); // Visszavisz az elejére siker esetén
    } else {
      alert("Hiba történt!");
    }
  };

  return (
    <div className='createEvent'>
      <div className="slider-container">
        <form onSubmit={handleSubmit}>
          <div 
            className="slider"
            style={{ "--index": currentIndex }}
          >
            {/* 1. SLIDE: Megnevezés + Leírás összevonva */}
            <div className="slide">
              <h3>Alapadatok</h3>
              <input
                type="text"
                placeholder="Esemény címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Esemény rövid leírása..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* 2. SLIDE: Helyszín */}
            <div className="slide">
              <h3>Helyszín</h3>
              <MapPicker onAddressSelect={(val) => setAddress(val)}/>
            </div>

            {/* 3. SLIDE: Média és Beküldés */}
            <div className="slide">
              <h3>Kép feltöltése</h3>
              <input
                type="file"
                className="file"
                id="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file" className='imgUpload'>Kép kiválasztása</label>
              
              <div className="preview-area">
                {preview ? (
                  <img src={preview} alt="előnézet" className="image-preview" />
                ) : (
                  <div className="placeholder-preview">Nincs kép kiválasztva</div>
                )}
              </div>
              
              <button className='upload' type="submit">Esemény létrehozása</button>
            </div>

          </div>

          {/* Navigációs gombok */}
          <div className="buttons">
            <button 
              type="button" 
              onClick={previous}
              disabled={currentIndex === 0}
            >
              Vissza
            </button>

            <button 
              type="button" 
              onClick={next}
              disabled={currentIndex === totalSlides - 1}
            >
              Tovább
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent;