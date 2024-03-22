import React, { CSSProperties } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './Main';
import Providers from './contexts'

function App() {
  return (
    <Providers>
      <div className="App" style={{ top: "2%", left: "3%", width: "94%", position: "absolute" }}>
        <Main />
      </div>
    </Providers>
  );
}

export default App;
