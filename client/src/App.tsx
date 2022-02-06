import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import React, {useState} from 'react';
import {MapView} from './components/map-view/MapView';
import {TopBar} from "./components/TopBar";
import {CurrentCrawl} from "./contexts/CurrentCrawl";
import {CurrentCrawlModel} from "./models/CurrentCrawlModel";
import {LoadingContext} from "./contexts/LoadingContext";
import {LoadingOverlay} from "./components/loading-overlay/LoadingOverlay";
import {PubList} from "./components/pub-list/PubList";

function App() {
    const [currentCrawl, setCurrentCrawl] = useState({pubs: [], route: []} as CurrentCrawlModel);
    const [loadingContext, setLoadingContext] = useState(false);
    const value = {currentCrawl, setCurrentCrawl};
    const loadingValue = {loadingContext, setLoadingContext};

    return (
        <div className="App">
            <CurrentCrawl.Provider value={value}>
                <TopBar/>
                {currentCrawl.pubs.length > 0 ? <PubList /> : ''}
                <LoadingContext.Provider value={loadingValue}>
                    {loadingContext ? <LoadingOverlay /> : ''}
                    <MapView/>
                </LoadingContext.Provider>
            </CurrentCrawl.Provider>
        </div>
    );
}

export default App;
