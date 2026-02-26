import React, { useState } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';

const EventMap = ({ address, title }) => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  // Ez a függvény akkor fut le, amikor a térkép objektum létrejött
  const handleMapLoad = () => {
    if (!address) return;

    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setCoords({ 
          lat: location.lat(), 
          lng: location.lng() 
        });
      } else {
        console.error("Geocoding hiba: " + status);
        setError(true);
      }
    });
  };

  return (
    <div className="event-map-wrapper" style={{ marginTop: '20px' }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coords || { lat: 47.4979, lng: 19.0402 }} // Alapértelmezett vészhelyzeti közép (Budapest)
          zoom={15}
          onLoad={handleMapLoad} // Itt hívjuk meg a geokódolót!
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {coords && <MarkerF position={coords} title={title} />}
        </GoogleMap>
        
        {error && (
          <p style={{ color: '#ff4b2b', fontSize: '12px', marginTop: '5px' }}>
            Helyszín nem megjeleníthető.
          </p>
        )}
      </LoadScript>
    </div>
  );
};

export default EventMap;