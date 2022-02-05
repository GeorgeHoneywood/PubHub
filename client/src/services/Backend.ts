import {PubData} from "../models/PubData";


export async function getRoute(pubs: PubData[]): Promise<string[]> {
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
    return response.json();
}