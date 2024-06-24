import React, { useState } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; 
import Login from './components/Login';
import StudentSearch from './components/StudentSearch';
import GroupSchedule from './components/GroupSchedule.js';
import { SERVER_URL } from './constants.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';


function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [username, setUsername] = useState("");

  const onLoginSuccess = (username, role) => {
    setUsername(username); 
    setShowFinancials(role === 'ADMIN');
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
        <title>LOCATORBASE</title>
        <AppBar position="static">
          <Toolbar>
            {/* ... existing code ... */}
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                  }}
                >
                  Search
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(true);
                  }}
                >
                  My Groups
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated ? (
          showWhoIsDoing ? (
            <GroupSchedule username={username} /> 
          ) : (
            <StudentSearch showFinancials={showFinancials} />
          )
        ) : (
          <Login onLoginSuccess={onLoginSuccess} />
        )}
      </div>
    </LocalizationProvider>
  );
  }

export default App;
