import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import "./MapPicker.css"

const libraries = ['places'];
const center = { lat: 46.9074, lng: 19.6917 }; // Budapest alapértelmezett

const MapPicker = ({ onAddressSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);

  // Geocoder inicializálása a térkép betöltésekor
  const onMapLoad = () => {
    geocoderRef.current = new window.google.maps.Geocoder();
  };

  // Reverse geocoding: koordinátákból szöveges cím
  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current) return;

    setIsGeocoding(true);

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        setIsGeocoding(false);

        if (status === "OK" && results[0]) {
          const fullAddress = results[0].formatted_address;
          setAddress(fullAddress);
          onAddressSelect(fullAddress);

          console.log("Mentett cím (térképkattintás):", fullAddress);
          console.log("Koordináták:", lat, lng);
        } else {
          console.warn("Reverse geocoding sikertelen:", status);
        }
      }
    );
  };

  // Autocomplete-ből kiválasztott cím kezelése
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();

    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const fullAddress = place.formatted_address;

      setSelectedLocation({ lat, lng });
      setAddress(fullAddress);
      onAddressSelect(fullAddress);

      console.log("Mentett cím:", fullAddress);
      console.log("Koordináták:", lat, lng);
    }
  };

  // Térképre kattintás kezelése
  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setSelectedLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div>

        {/* Címkereső beviteli mező */}
        <Autocomplete
          style={{ color: "black" }}
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
          onLoad={onMapLoad}
          onClick={onMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>

        {isGeocoding && (
          <div style={{ marginTop: "10px", color: "#888" }}>
            Cím lekérése...
          </div>
        )}

        {address && !isGeocoding && (
          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Kiválasztott hely: {address}
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default MapPicker;