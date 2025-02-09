import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import Calendar from './components/Calendar';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

export default App;
