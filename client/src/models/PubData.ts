import {Position} from "./Position";

export interface PubData {
    name: string;
    openingHours: string | null;
    position: Position;
}