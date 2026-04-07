import React, { useState } from 'react'
import { addEvent } from "../utils";
import MapPicker from './MapPicker';
import './CreateEvent.css';
import { useContext } from 'react';
import { useNavigate } from 'react-router'
import { myUserContext } from '../context/MyContextProvider';

const CreateEvent = () => {
  const {setMsg} = useContext(myUserContext)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate()
  // Több kép kezelése
  // images: [{ file: File, preview: string }]
  const [images, setImages] = useState([]);

  const totalSlides = 3;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    const newImages = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // input value reset, hogy ugyanazt a fájlt újra lehessen választani
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
    if (currentIndex < totalSlides - 1) setCurrentIndex((prev) => prev + 1);
  };

  const previous = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const files = images.map((img) => img.file);

    const result = await addEvent(
      { title, address, description },
      files
    );

    if (result?.ok) {
      setMsg({success:"Sikeresen létrehoztad az eseményed: " + title})

      setTitle("");
      setDescription("");
      setAddress("");
      // preview URL-ek felszabadítása
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setCurrentIndex(0);
      navigate("/profile")
    } else {
      setMsg({err:"Hiba történt az esemény létrehozásakor"})
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
            {/* 1. SLIDE: Alapadatok */}
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
              <MapPicker onAddressSelect={(val) => setAddress(val)} />
            </div>

            {/* 3. SLIDE: Képek feltöltése */}
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
                      <img
                        src={img.preview}
                        alt={`kép ${idx + 1}`}
                        className="image-thumb"
                      />
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => removeImage(idx)}
                        title="Kép eltávolítása"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="placeholder-preview">Nincs kép kiválasztva</div>
              )}

              <button className='upload' type="submit">
                Esemény létrehozása
              </button>
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
  );
};

export default CreateEvent;