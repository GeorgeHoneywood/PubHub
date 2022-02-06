import {PubData} from "../models/PubData";
import {Position} from "../models/Position";
import {CurrentCrawlModel} from "../models/CurrentCrawlModel";
import {decodePolyline} from "../components/map-view/helper";

export async function getRoute(pubs: PubData[]): Promise<CurrentCrawlModel> {
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
    return response.json().then(value =>{
        let routes: Position[] = [];
        value.shapes.forEach((v) => {
            routes.push(...decodePolyline(v).map(coord => ({longitude: coord[0], latitude: coord[1]} as Position)));
        })
        console.log(pubs);
        console.log(value.locations);
        return ({
            pubs: value.locations.map((v) => ({
                name: pubs.find((pub) => pub.position.latitude.toFixed(4) === v.lat.toFixed(4) && pub.position.longitude.toFixed(4) === v.lon.toFixed(4))?.name,
                position: {latitude: v.lat, longitude: v.lon} as Position
            })),
            route: routes
        } as CurrentCrawlModel);
    });
}