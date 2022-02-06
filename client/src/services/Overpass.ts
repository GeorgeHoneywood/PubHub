import {LngLatBounds} from "mapbox-gl";
import {PubData} from "../models/PubData";
import {Position} from "../models/Position";

export async function getPubs(bounds: LngLatBounds): Promise<PubData[]> {
    let pubs: PubData[] = [];
    const heightMargin = Math.abs(bounds?.getNorth() - bounds?.getSouth()) * 0.1;
    const widthMargin = Math.abs(bounds?.getWest() - bounds?.getEast()) * 0.1;
    const formattedBounds = `${bounds?.getSouth() + heightMargin},${bounds?.getWest() + widthMargin},${bounds?.getNorth() - heightMargin},${bounds?.getEast() - widthMargin}`
    const overpassQuery = `[out:json][timeout:25];(nwr["amenity"~"pub|bar"](${formattedBounds});); out center;`

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        "body": `data=${encodeURIComponent(overpassQuery)}`,
        "method": "POST",
    });

    const data = await response.json();

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
    }
    return pubs;
}

export async function getPubsInRegion(region: Position[]): Promise<PubData[]> {
    let pubs: PubData[] = [];
    const pos = region.map((value) => [value.longitude, value.latitude]).slice(0, region.length - 1).join(" ").replaceAll(",", " ");
    console.log(pos)
    const overpassQuery = `[out:json][timeout:25];(nwr["amenity"~"pub|bar"](poly:"${pos}");); out center;`
    console.log(overpassQuery);

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        "body": `data=${encodeURIComponent(overpassQuery)}`,
        "method": "POST",
    });

    const data = await response.json();

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
    }
    return pubs;
}