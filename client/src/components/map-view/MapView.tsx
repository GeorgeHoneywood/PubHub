import React, {useEffect, useRef, useState, useContext} from "react";
import mapboxgl, {Map} from "mapbox-gl";
import MapboxGeocoder from 'mapbox-gl-geocoder';
import styles from './MapView.module.css';
import {CurrentCrawl} from "../../contexts/CurrentCrawl";


mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';


export function MapView() {
    const { currentCrawl } = useContext(CurrentCrawl);
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);
    const [lng, setLng] = useState(-0.11);
    const [lat, setLat] = useState(51.5);
    const [zoom, setZoom] = useState(9);

    useEffect(() => {
        //if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current || "",
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom,
        });

        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                // When active the map will receive updates to the device's location as it changes.
                trackUserLocation: true,
                // Draw an arrow next to the location dot to indicate which direction the device is heading.
                showUserHeading: true
            })
        );

        map.current.on('move', () => {
            if (!map.current) return;
            setLng(map.current.getCenter().lng);
            setLat(map.current.getCenter().lat);
            setZoom(map.current.getZoom());
        });

        const geocoder = new MapboxGeocoder({
            // Initialize the geocoder
            accessToken: mapboxgl.accessToken, // Set the access token
            mapboxgl: mapboxgl, // Set the mapbox-gl instance
            marker: false, // Do not use the default marker style
            placeholder: 'Search here', // Placeholder text for the search bar
            //bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary for Berkeley
            proximity: {
                longitude: lng,
                latitude: lat
            }
        });
        map.current.addControl(geocoder); // https://docs.mapbox.com/help/tutorials/local-search-geocoding-api/#the-bbox-parameter

    }, []);

    let pubs: any[] = [];

    async function getPubs() {
        if (!map.current || zoom < 13) return;

        const bounds = map.current?.getBounds()
        const formattedBounds = `${bounds?.getSouth()},${bounds?.getWest()},${bounds?.getNorth()},${bounds?.getEast()}`
        const overpassQuery = `[out:json][timeout:25];(nwr["amenity"="pub"](${formattedBounds});); out center;`

        console.log("get pubs");
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            "body": `data=${encodeURIComponent(overpassQuery)}`,
            "method": "POST",
        });

        const data = await response.json();
        console.log(data);

        for (const element of data.elements) {
            let lat = 0
            let lon = 0

            if (element.type === 'node') {
                lat = element.lat;
                lon = element.lon;
            } else {
                lat = element.center.lat;
                lon = element.center.lon;
            }

            pubs.push({lon, lat, name: element.tags.name})

            new mapboxgl.Marker()
                .setLngLat({lon, lat})
                .setPopup(
                    new mapboxgl.Popup({offset: 25}) // add popups
                        .setHTML(
                            `<h3>${(element.tags && element.tags.name) || "N/A"}</h3>`
                        )
                )
                .addTo(map.current);
        }
    }

    return (
        <>
            <div className={styles.sidebar} onClick={getPubs}>
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container"/>
        </>
    )
}