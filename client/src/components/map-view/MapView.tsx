/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState, useContext} from "react";
import mapboxgl, {Map, Marker} from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import styles from './MapView.module.css';
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import {Position} from "../../models/Position";

import { decodePolyline } from './helper'
import {PubData} from "../../models/PubData";
import {getPubs, getPubsInRegion} from "../../services/Overpass";
import {getRoute} from "../../services/Backend";


mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';


export function MapView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {currentCrawl} = useContext(CurrentCrawl);
    const [pubs, setPubs] = useState([] as PubData[]);
    const [markers, setMarkers] = useState([] as Marker[]);
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
            defaultMode: 'draw_polygon',
        });
        map.current.addControl(draw);

        const updateArea = async (e) => {
            const data = draw.getAll();
            if (data.features.length > 0) {
                let index = data.features.length - 1;
                const coordinates = data.features[index].geometry.coordinates[0].map((value) => {
                    return {latitude: value[0], longitude: value[1]} as Position;
                });
                console.log(coordinates);
                // Restrict the area to 2 decimal points.
                if (data.features.length > 1) {
                    data.features.forEach((value, i) => {
                        if (i < index) draw.delete(value.id);
                    });
                }
                let l = await getPubsInRegion(coordinates);
                setPubs(l);
            } else {
                if (e.type !== 'draw.delete')
                    alert('Click the map to draw a polygon.');
            }
        };
        map.current.on('draw.create', updateArea);
        map.current.on('draw.delete', updateArea);
        map.current.on('draw.update', updateArea);
        map.current.on('draw.move', updateArea);

    }, []);

    useEffect(() => {
        if (map.current?.getLayer("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
        }
        markers.forEach((value: Marker) => {value.remove()});
        let tempList: Marker[] = [];
        setMarkers(() => []);
        pubs.forEach((value: PubData) => {
            if (!map.current) return;
            let m = new mapboxgl.Marker()
                .setLngLat({lon: value.position.longitude, lat: value.position.latitude})
                .setPopup(
                    new mapboxgl.Popup({offset: 25}) // add popups
                        .setHTML(
                            `<h3>${value.name || "N/A"}</h3>`
                        )
                )
                .addTo(map.current);
            tempList.push(m);
        })
        setMarkers(() => tempList);
        retrieveRoute(pubs);
    }, [pubs]);

    async function retrievePubs() {
        if (!map.current || zoom < 13) return;

        const pubs = await getPubs(map.current?.getBounds());
        setPubs((prevValue) => {
            return pubs;
        });

        await retrieveRoute(pubs)
    }

    async function retrieveRoute(pubs: PubData[]) {
        if (!map.current || pubs.length < 2) return;

        const data = await getRoute(pubs);

        let concatenatedLines: any[] = []

        for (const encodedLine of data) {
            concatenatedLines.push(...decodePolyline(encodedLine))
        }

        // FIXME: this only works the first time :(
        if (map.current?.getLayer("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
        }
        map.current?.addLayer({
            id: 'route',
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

    return (
        <>
            <div className={styles.sidebar} onClick={retrievePubs}>
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container"/>
        </>
    )
}