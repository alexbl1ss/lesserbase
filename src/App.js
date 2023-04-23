import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Login from './Login';
import Search from './components/Search';
import InvoicePage from './components/InvoicePage';

function App() {
  return (
    <div className="App">
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Bliss Invoicing
            </Typography>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/invoice" element={<InvoicePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
