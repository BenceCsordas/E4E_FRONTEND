import React, { useState } from 'react'
import { addEvent } from "../utils";
import MapPicker from './MapPicker';
const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [mapsLocation, setMapsLocation] = useState("")
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0)
  const [preview, setPreview] = useState(null);
  const totalSlides = 4

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
      { title, mapsLocation, description }, 
      file
    );

    if (result?.ok) {
      alert("Sikeres létrehozás!");
      setTitle("");
      setLocation("");
      setDescription("");
      setMapsLocation("")
      setFile(null);
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
            style={{
              "--index": currentIndex
            }}
          >

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Esemény megnevezése</h3>
              <input
                type="text"
                placeholder="Esemény címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Helyszín kiválasztása</h3>
                    <input
              type="text"
              placeholder="Helyszín"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <MapPicker setMapsLocation={setMapsLocation}/>
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Esemény rövid leírása</h3>
              <textarea
        placeholder="Leírás"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Kép feltöltése</h3>
              <input
  type="file"
  className="file"
  id="file"
  accept="image/*"
  onChange={handleFileChange}
/>
      <label htmlFor="file" className='imgUpload'>Kép feltöltése</label>
              {preview && <img src={preview} alt="előnézet" />}
              <button className='upload' type="submit">Esemény hozzáadása</button>
            </div>

          </div>

          <div className="buttons">
            <button 
              type="button" 
              onClick={previous}
              disabled={currentIndex === 0}
            >
              Előző
            </button>

            <button 
              type="button" 
              onClick={next}
              disabled={currentIndex === totalSlides - 1}
            >
              Következő
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateEvent
