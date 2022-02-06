import {createContext, Dispatch, SetStateAction} from "react";
import {CurrentCrawlModel} from "../models/CurrentCrawlModel";

export const CurrentCrawl = createContext({
    currentCrawl: {} as CurrentCrawlModel,
    setCurrentCrawl: (() => {}) as Dispatch<SetStateAction<CurrentCrawlModel>>
});