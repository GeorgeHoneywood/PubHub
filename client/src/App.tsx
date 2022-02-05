import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// this is fine :))
mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    // FIXME: these ts ignores, see https://stackoverflow.com/questions/60322612/what-are-the-correct-types-to-map-variables-using-mapbox-in-react/60334542#60334542
    // @ts-ignore
    map.current = new mapboxgl.Map({
      // @ts-ignore
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom,
    });
  });

  return (
    <div className="App">
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
