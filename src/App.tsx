import React, { CSSProperties } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './Main';
import Providers from './contexts'
import { Box } from '@mui/material';

function App() {
  return (
    <Providers>
      <Box sx={{marginTop: '3vh', marginLeft: '2vw', marginRight: '2vw', position: 'absolute', height: '96vh'}}>
        <Main />
      </Box>
    </Providers>
  );
}

export default App;
