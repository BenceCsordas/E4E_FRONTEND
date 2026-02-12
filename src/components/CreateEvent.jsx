import React, { useState } from 'react'
import { addEvent } from "../utils";
const CreateEvent = () => {

  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = 4

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

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addEvent(
      { title, location, description }, 
      file
    );

    if (result?.ok) {
      alert("Sikeres létrehozás!");
      setTitle("");
      setLocation("");
      setDescription("");
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
              display: "flex",
              transition: "transform 0.4s ease-in-out",
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Step 1</h3>
              <input
                type="text"
                placeholder="Esemény címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Step 2</h3>
                    <input
              type="text"
              placeholder="Helyszín"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Step 3</h3>
              <textarea
        placeholder="Leírás"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
            </div>

            <div className="slide" style={{ minWidth: "100%" }}>
              <h3>Finish</h3>
              <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
              <button type="submit">Hozzáadás</button>
            </div>

          </div>

          <div className="buttons">
            <button 
              type="button" 
              onClick={previous}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            <button 
              type="button" 
              onClick={next}
              disabled={currentIndex === totalSlides - 1}
            >
              Next
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateEvent
