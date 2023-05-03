import React from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; 
import Login from './components/Login';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}> 
            <Typography variant="h6">
              Bliss Bill View
            </Typography>
            <Button color="inherit">Your Button Text</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Login />
    </div>
  );
}

export default App;
