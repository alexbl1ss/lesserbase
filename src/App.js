import React, { useState } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'; 
import Login from './components/Login';
import StudentSearch from './components/StudentSearch';
import WhoIsDoing from './components/WhoIsDoing';
import Transfers from './components/Transfers';
import { SERVER_URL } from './constants.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';
import Rent from './components/Rent';
import Rooms from './components/rooms.js'
import Planner from './components/Planner.js'


function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showRentPage, setShowRentPage] = useState(false);
  const [showTransfers, setShowTransfers] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  const onLoginSuccess = (role) => {
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
        <title>SBC</title>
        <AppBar position="static">
          <Toolbar>
            {/* ... existing code ... */}
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                    setShowRentPage(false);
                    setShowTransfers(false);
                    setShowRooms(false);
                    setShowPlanner(false)
                  }}
                >
                  Students
                </Button><Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                    setShowRentPage(false);
                    setShowTransfers(false);
                    setShowRooms(true);
                    setShowPlanner(false)
                  }}
                >
                  Rooms
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(true);
                    setShowRentPage(false);
                    setShowTransfers(false);
                    setShowRooms(false);
                    setShowPlanner(false)
                  }}
                >
                  Planner
                </Button><Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                    setShowRentPage(false);
                    setShowTransfers(false);
                    setShowRooms(false);
                    setShowPlanner(true)
                  }}
                >
                  New Planner
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                    setShowRentPage(false);
                    setShowTransfers(true);
                    setShowRooms(false);
                    setShowPlanner(false)
                  }}
                >
                  Transfers
                </Button>
                {showFinancials && (
                  <Button
                    color="inherit"
                    onClick={() => {
                      setShowWhoIsDoing(false);
                      setShowRentPage(true);
                      setShowTransfers(false);
                      setShowRooms(false);
                      setShowPlanner(false)
                    }}
                  >
                    Costs
                  </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated ? (
          showWhoIsDoing ? (
            <WhoIsDoing />
          ) : showRentPage ? (
            <Rent />
          ) : showTransfers ? (
            <Transfers />
          ) : showRooms ? (
            <Rooms />
          ) : showPlanner ? (
            <Planner />
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
