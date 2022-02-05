import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import React, {useState} from 'react';
import {MapView} from './components/map-view/MapView';
import {TopBar} from "./components/TopBar";
import {CurrentCrawl} from "./contexts/CurrentCrawl";
import {CurrentCrawlModel} from "./models/CurrentCrawlModel";

function App() {
    const [currentCrawl, setCurrentCrawl] = useState({} as CurrentCrawlModel);
    const value = {currentCrawl, setCurrentCrawl};

    return (
        <div className="App">
            <CurrentCrawl.Provider value={value}>
                <TopBar/>
                <MapView/>
            </CurrentCrawl.Provider>
        </div>
    );
}

export default App;
