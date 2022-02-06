import {PubData} from "../models/PubData";
import {Position} from "../models/Position";
import {CurrentCrawlModel} from "../models/CurrentCrawlModel";
import {decodePolyline} from "../components/map-view/helper";

export async function getRoute(pubs: PubData[]): Promise<CurrentCrawlModel> {
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/route`, {
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
        return ({
            pubs: value.locations.map((v) => ({
                name: pubs.at(v.original_index)?.name,
                position: {latitude: v.lat, longitude: v.lon} as Position,
                openingHours: pubs.at(v.original_index)?.openingHours
            })),
            route: routes,
            distance: value.distance,
            time: value.time
        } as CurrentCrawlModel);
    });
}