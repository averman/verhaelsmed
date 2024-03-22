import React, { CSSProperties } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './Main';
import {SettingsDataProvider} from './contexts/SettingsDataContext'

function App() {
  return (
    <SettingsDataProvider>
      <div className="App" style={{ top: "2%", left: "3%", width: "94%", position: "absolute" }}>
        <Main />
      </div>
    </SettingsDataProvider>
  );
}

export default App;
