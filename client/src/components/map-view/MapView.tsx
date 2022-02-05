/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState, useContext} from "react";
import mapboxgl, {Map} from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import styles from './MapView.module.css';
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import {Position} from "../../models/Position";

import { decodePolyline } from './helper'
import {PubData} from "../../models/PubData";


mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';


export function MapView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {currentCrawl} = useContext(CurrentCrawl);
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

        const draw = new MapboxDraw({
            displayControlsDefault: false,
// Select which mapbox-gl-draw control buttons to add to the map.
            controls: {
                polygon: true,
                trash: true
            },
// Set mapbox-gl-draw to draw by default.
// The user does not have to click the polygon control button first.
            defaultMode: 'draw_polygon'
        });
        map.current.addControl(draw);

        const updateArea = (e) => {
            const data = draw.getAll();
            if (data.features.length > 0) {
                let coordinates: Position[] = [];
                data['features'][0]['geometry']['coordinates'][0].forEach((val) => {
                    coordinates.push({latitude: val[0], longitude: val[1]} as Position)
                });
                console.log(coordinates);
                // Restrict the area to 2 decimal points.
            } else {
                if (e.type !== 'draw.delete')
                    alert('Click the map to draw a polygon.');
            }
        };
        map.current.on('draw.create', updateArea);
        map.current.on('draw.delete', updateArea);
        map.current.on('draw.update', updateArea);

    }, []);

    let pubs: PubData[] = [];

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

            pubs.push({position: {longitude: lon, latitude: lat}, name: element.tags.name})

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

        await getRoute(pubs)
    }

    async function getRoute(pubs: PubData[]) {
        if (!map.current || pubs.length < 2) return;

        const response = await fetch("http://localhost:8000/route", {
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify({
                locations: pubs.map(pub => ({
                    lat: pub.position.latitude,
                    lon: pub.position.longitude
                }))
            }),
            "method": "POST",
        });

        const data = await response.json();

        let concatenatedLines: any[] = []

        for (const encodedLine of data) {
            concatenatedLines.push(...decodePolyline(encodedLine))
        }

        // FIXME: this only works the first time :(
        if (!map.current.getLayer('mapline')) {
            map.current.addLayer({
                id: 'mapline',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': concatenatedLines,
                        }
                    },
                },
                paint: { 'line-width': 4, 'line-color': '#000' },
            });
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