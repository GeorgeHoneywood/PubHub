import {PubData} from "../contexts/PubData";
import {Position} from "../contexts/Position";

export interface CurrentCrawlModel {
    pubs: PubData[],
    route: Position[]
}