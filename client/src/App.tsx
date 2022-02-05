import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {MapView} from './components/map-view/MapView';
import {TopBar} from "./components/TopBar";

function App() {

    return (
        <div className="App">
            <TopBar />
            <MapView/>
        </div>
    );
}

export default App;
