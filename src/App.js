import React, { useState, useEffect } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; 
import Login from './components/Login';
import StudentSearch from './components/StudentSearch';
import WhoIsDoing from './components/WhoIsDoing';
import { SERVER_URL } from './constants.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);


  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    setAuth(authStatus === 'true');
  }, []);

  const onLoginSuccess = () => {
    setAuth(true);
  };

  const handleLogout = () => {

    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((err) => console.error(err));

    sessionStorage.removeItem('isAuthenticated');
    setAuth(false);
  };
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
    <div className="App">
          <title>SBC</title>
    <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6">
              Bliss Bill View
            </Typography>
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                  }}
                >
                  Students
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(true);
                  }}
                >
                  Planner
                </Button>
                <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {isAuthenticated ? (
        showWhoIsDoing ? (
          <WhoIsDoing />
        ) : (
          <StudentSearch />
        )
      ) : (
        <Login onLoginSuccess={onLoginSuccess} />
      )}
    </div>
    </LocalizationProvider>
  );
      }

export default App;
