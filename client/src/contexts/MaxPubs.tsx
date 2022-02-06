import {createContext, Dispatch, SetStateAction} from "react";


export const MaxPubs = createContext({
    maxPubs: 50,
    setMaxPubs: (() => {}) as Dispatch<SetStateAction<number>>
})