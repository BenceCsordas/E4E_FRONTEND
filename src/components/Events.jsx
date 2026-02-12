import { useState } from "react";
import { addEvent } from "../utils";

const Events = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addEvent(
      { title, location, description }, // ✅ description is megy
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Esemény címe"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Helyszín"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <textarea
        placeholder="Leírás"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit">Hozzáadás</button>
    </form>
  );
};

export default Events;
