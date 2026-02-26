import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import "./MapPicker.css"
const libraries = ['places'];
const center = { lat: 47.4979, lng: 19.0402 }; // Budapest alapértelmezett

const MapPicker = ({onAddressSelect}) => {
  const [selectedLocation, setSelectedLocation] = useState(null); // Koordináták mentése
  const [address, setAddress] = useState(""); // Szöveges cím mentése
  const autocompleteRef = useRef(null);

  // Ez fut le, amikor a felhasználó kiválaszt egy címet a listából
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const fullAddress = place.formatted_address;

      // Mentés változókba/state-be
      setSelectedLocation({ lat, lng });
      setAddress(fullAddress);
      onAddressSelect(fullAddress);

      console.log("Mentett cím:", fullAddress);
      console.log("Koordináták:", lat, lng);
      

    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div style={{}}>
        
        {/* Címkereső beviteli mező */}
        <Autocomplete
            style={{color:"black"}}
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Keress egy helyszínt..."
            className="google-search-input"
            style={{
              width: "100%",
              height: "40px",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </Autocomplete>

        {/* Térkép megjelenítése */}
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '15px' }}
          center={selectedLocation || center}
          zoom={15}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>

        {address && (
          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Kiválasztott hely: {address}
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default MapPicker;