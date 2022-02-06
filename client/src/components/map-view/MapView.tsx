/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useContext } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import styles from './MapView.module.css';
import { CurrentCrawl } from "../../contexts/CurrentCrawl";
import { Position } from "../../models/Position";
import debounce from "lodash/debounce"
import { PubData } from "../../models/PubData";
import { getPubs, getPubsInRegion } from "../../services/Overpass";
import { getRoute } from "../../services/Backend";
import { LoadingContext } from "../../contexts/LoadingContext";
import { Toast, ToastContainer } from "react-bootstrap";
import {MaxPubs} from "../../contexts/MaxPubs";

mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZXlmb3giLCJhIjoiY2t6OXVicGU2MThyOTJvbnh1a21idjhkZSJ9.LMyDoR9cFGG3HqAc9Zlwkg';

export function MapView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentCrawl, setCurrentCrawl } = useContext(CurrentCrawl);
    const [pubs, setPubs] = useState([] as PubData[]);
    const [markers, setMarkers] = useState([] as Marker[]);
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);
    const [lng, setLng] = useState(-0.11);
    const [lat, setLat] = useState(51.5);
    const [zoom, setZoom] = useState(9);
    const [show, setShow] = useState(false);
    const [region, setRegion] = useState([] as Position[]);
    const {setLoadingContext} = useContext(LoadingContext);
    const {maxPubs} = useContext(MaxPubs);
    // TODO: leading: true should only be when come into zoom
    const debouncedGetPubs = debounce(async () => {
        if (!map.current) return;
        if (map.current.getZoom() < 14){
            setLoadingContext(false);
            return;
        }
        const newPubs = await getPubs(map.current?.getBounds());
        const currentPosition = {latitude: lat, longitude: lng} as Position;
        newPubs.sort((a, b) => {
            const aDistance = Math.hypot(a.position.latitude - currentPosition.latitude, a.position.longitude - currentPosition.longitude);
            const bDistance = Math.hypot(b.position.latitude - currentPosition.latitude, b.position.longitude - currentPosition.longitude);
            return aDistance - bDistance;
        });
        setPubs(newPubs);
    }, 2 * 1000, { trailing: true });

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
                positionOptions: { enableHighAccuracy: true },
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
            //defaultMode: 'draw_polygon',
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

        if (map.current.getZoom() > 14) {
            setLoadingContext(true)
            debouncedGetPubs()
        }

        const updateArea = async (e) => {
            const data = draw.getAll();
            let coordinates = [];
            if (data.features.length > 0) {
                let index = data.features.length - 1;
                coordinates = data.features[index].geometry.coordinates[0].map((value) => ({
                    latitude: value[0],
                    longitude: value[1]
                }));
                if (data.features.length > 1) data.features.forEach((value, i) => i < index ? draw.delete(value.id) : null);
                setRegion(coordinates);
            } else if (data.features.length === 0) {
                setLoadingContext(true);
                debouncedGetPubs();
                setRegion([]);
            }
        };
        map.current.on('draw.create', updateArea);
        map.current.on('draw.delete', updateArea);
        map.current.on('draw.update', updateArea);
        map.current.on('draw.move', updateArea);

    }, []);

    useEffect(() => {
        if (region && region.length >= 3) {
            getPubsInRegion(region).then(value => setPubs(value));
        }
        setLoadingContext(false);
    }, [region])

    useEffect(() => {
        if (map.current?.getLayer("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
        }
        markers.forEach((value: Marker) => value.remove());
        if (pubs.length < 50) {
            retrieveRoute(pubs);
        } else {
            setShow(true);
            setLoadingContext(false)
        }
    }, [pubs]);

    useEffect(() => {
        markers.forEach((value: Marker) => value.remove());
        let tempList: Marker[] = [];
        setMarkers(() => []);
        currentCrawl.pubs.forEach((value: PubData, index: number) => {
            if (!map.current) return;

            let m = new mapboxgl.Marker({
                color: index === 0 ? "#0d6efd" : "#ffcc4d",
                scale: index === 0 ? 1 : 0.8,
            })
                .setLngLat({ lon: value.position.longitude, lat: value.position.latitude })
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setHTML(
                            `<h5>${value.name || "N/A"}</h5><p>${value.openingHours || "N/A"}</p>`
                        )
                )
                .addTo(map.current);
            tempList.push(m);
        })
        setMarkers(tempList);
        setLoadingContext(false);
    }, [currentCrawl])

    useEffect(() => {
        setLoadingContext(true);
        retrieveRoute(pubs);
    }, [maxPubs])

    const retrieveRoute = debounce(async (pubs: PubData[]) => {
        if (!map.current || pubs.length < 2) {
            setLoadingContext(false);
            return;
        }
        let pubData = pubs;
        if(pubData.length > maxPubs) {
            pubData = pubs.slice(0, maxPubs);
        }
        await getRoute(pubData).then((data) => {
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
                paint: { 'line-width': 4, 'line-color': '#ffcc4d' },
            });
            setCurrentCrawl(data);
        }).finally(() => {
            setLoadingContext(false)
        });
    }, 0.25 * 1000, {leading: true})

    return (
        <>
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 999 }}>
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
            <div ref={mapContainer} className={styles.mapContainer} />
        </>
    )
}