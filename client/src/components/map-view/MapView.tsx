/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState, useContext} from "react";
import mapboxgl, {Map, Marker} from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import styles from './MapView.module.css';
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import {Position} from "../../models/Position";
import debounce from "lodash/debounce"

import {decodePolyline} from './helper'
import {PubData} from "../../models/PubData";
import {getPubs, getPubsInRegion} from "../../services/Overpass";
import {getRoute} from "../../services/Backend";
import {LoadingContext} from "../../contexts/LoadingContext";
import {Toast, ToastContainer} from "react-bootstrap";

mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';

export function MapView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {currentCrawl, setCurrentCrawl} = useContext(CurrentCrawl);
    const [pubs, setPubs] = useState([] as PubData[]);
    const [markers, setMarkers] = useState([] as Marker[]);
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);
    const [lng, setLng] = useState(-0.11);
    const [lat, setLat] = useState(51.5);
    const [zoom, setZoom] = useState(9);
    const [show, setShow] = useState(true);
    const [region, setRegion] = useState([] as Position[]);
    const {loadingContext, setLoadingContext} = useContext(LoadingContext);
    // TODO: leading: true should only be when come into zoom
    const debouncedGetPubs = debounce(retrievePubs, 2 * 1000, {trailing: true});

    useEffect(() => {
        map.current = new mapboxgl.Map({
            container: mapContainer.current || "",
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom,
            hash: true,
        });

        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {enableHighAccuracy: true},
                // When active the map will receive updates to the device's location as it changes.
                trackUserLocation: true,
                // Draw an arrow next to the location dot to indicate which direction the device is heading.
                showUserHeading: true
            })
        );

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

        map.current.on('move', async () => {
            if (!map.current || region.length !== 0) return;
            setLng(map.current.getCenter().lng);
            setLat(map.current.getCenter().lat);
            setZoom(map.current.getZoom());

            if (map.current.getZoom() > 14) {
                setLoadingContext(true)
                await debouncedGetPubs()
            }
        });

        const updateArea = async (e) => {
            const data = draw.getAll();
            if (data.features.length > 0) {
                let index = data.features.length - 1;
                const coordinates = data.features[index].geometry.coordinates[0].map((value) => ({
                    latitude: value[0],
                    longitude: value[1]
                }));
                if (data.features.length > 1) data.features.forEach((value, i) => i < index ? draw.delete(value.id) : null);
                setRegion(coordinates);
            }
        };
        map.current.on('draw.create', updateArea);
        map.current.on('draw.delete', updateArea);
        map.current.on('draw.update', updateArea);
        map.current.on('draw.move', updateArea);

    }, []);

    useEffect(() => {
        getPubsInRegion(region).then(value => setPubs(value));
    }, [region])

    useEffect(() => {
        if (map.current?.getLayer("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
        }
        markers.forEach((value: Marker) => value.remove());
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
        if (pubs.length < 50) {
            retrieveRoute(pubs);
        } else {
            setShow(true);
            setLoadingContext(false)
        }
    }, [pubs]);

    async function retrievePubs() {
        if (!map.current) return;
        if (map.current.getZoom() < 14) return;
        const pubs = await getPubs(map.current?.getBounds());
        setPubs(pubs);
    }

    async function retrieveRoute(pubs: PubData[]) {
        if (!map.current || pubs.length < 2) return;
        const data = await getRoute(pubs);

        // concatenatedLines: [[number, number]] //
        let concatenatedLines = data.route.map((value => [value.longitude, value.latitude]));
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
            paint: {'line-width': 4, 'line-color': '#000'},
        });
        setCurrentCrawl(data);
        setLoadingContext(false);
    }

    return (
        <>
            <ToastContainer position="top-end" className="p-3" style={{zIndex: 999}}>
                <Toast onClose={() => setShow(false)} show={show} delay={7000} bg={'danger'} autohide>
                    <Toast.Header>
                        <img
                            src="holder.js/20x20?text=%20"
                            className="rounded me-2"
                            alt=""
                        />
                        <strong className="me-auto">Route Error</strong>
                    </Toast.Header>
                    <Toast.Body>Cannot create route: More than 50 pubs/bars in view</Toast.Body>
                </Toast>
            </ToastContainer>
            <div className={styles.sidebar} onClick={retrievePubs}>
                Longitude: {lng} | Latitude: {lat} |
                Zoom: {zoom} {zoom < 14 ? "| Zoom in to see pubs" : ""} {loadingContext ? "| Loading..." : ""} {pubs.length > 0 ? `| ${pubs.length} pubs found` : ""}
            </div>
            <div ref={mapContainer} className={styles.mapContainer}/>
        </>
    )
}