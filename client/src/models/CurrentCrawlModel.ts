import {PubData} from "./PubData";
import {Position} from "./Position";

export interface CurrentCrawlModel {
    pubs: PubData[],
    route: Position[],
    distance: number,
    time: number
}