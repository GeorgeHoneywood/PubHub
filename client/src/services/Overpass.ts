import { LngLatBounds } from "mapbox-gl";
import { PubData } from "../models/PubData";
import { Position } from "../models/Position";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter"
const OVERPASS_BASE_QUERY = `[out:json][timeout:25];(nwr["amenity"~"pub|bar"](%BOUNDS%);); out center;`

export async function getPubs(bounds: LngLatBounds): Promise<PubData[]> {
    const heightMargin = Math.abs(bounds?.getNorth() - bounds?.getSouth()) * 0.1;
    const widthMargin = Math.abs(bounds?.getWest() - bounds?.getEast()) * 0.1;
    const formattedBounds = `${bounds?.getSouth() + heightMargin},${bounds?.getWest() + widthMargin},${bounds?.getNorth() - heightMargin},${bounds?.getEast() - widthMargin}`;

    return queryOverpass(formattedBounds);
}

export async function getPubsInRegion(region: Position[]): Promise<PubData[]> {
    const pos = region.map((value) => [value.longitude, value.latitude]).slice(0, region.length - 1).join(" ").replaceAll(",", " ");

    return queryOverpass(`poly:"${pos}"`);
}

async function queryOverpass(bounds: string): Promise<PubData[]> {
    const query = OVERPASS_BASE_QUERY.replace("%BOUNDS%", bounds);

    const response = await fetch(OVERPASS_URL, {
        "body": `data=${encodeURIComponent(query)}`,
        "method": "POST",
    });

    return parseOverpassResponse(response);
}

async function parseOverpassResponse(response: any): Promise<PubData[]> {
    const data = await response.json();

    let pubs: PubData[] = [];
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

        pubs.push({
            position: { longitude: lon, latitude: lat },
            name: element.tags.name,
            openingHours: element.tags.opening_hours || null,
        })
    }

    return pubs;
}