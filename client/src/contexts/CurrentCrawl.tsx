import {createContext, Dispatch, SetStateAction} from "react";
import {CurrentCrawlModel} from "../models/CurrentCrawlModel";

const CurrentCrawl = createContext({
    currentCrawl: {} as CurrentCrawlModel,
    setCurrentCrawl: (() => {}) as Dispatch<SetStateAction<CurrentCrawlModel>>
});

export {CurrentCrawl};