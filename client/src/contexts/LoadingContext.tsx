import {createContext, Dispatch, SetStateAction} from "react";

export const LoadingContext = createContext({
    loadingContext: false,
    setLoadingContext: (() => {}) as Dispatch<SetStateAction<boolean>>
})