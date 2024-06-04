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


function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);
  const [showRentOption, setShowRentOption] = useState(false);
  const [showPaymentsTab, setShowPaymentsTab] = useState(false);
  const [showRentPage, setShowRentPage] = useState(false);
  const [showTransfers, setShowTransfers] = useState(false);


  const onLoginSuccess = (role) => {
    setShowRentOption(role === 'ADMIN');
    setShowPaymentsTab(role === 'ADMIN');
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
                  }}
                >
                  Students
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(true);
                    setShowRentPage(false);
                    setShowTransfers(false);
                  }}
                >
                  Planner
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setShowWhoIsDoing(false);
                    setShowRentPage(false);
                    setShowTransfers(true);
                  }}
                >
                  Transfers
                </Button>
                {showRentOption && (
                  <Button
                    color="inherit"
                    onClick={() => {
                      setShowWhoIsDoing(false);
                      setShowRentPage(true);
                      setShowTransfers(false);
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
          ) : (
            <StudentSearch showPaymentsTab={showPaymentsTab} />
          )
        ) : (
          <Login onLoginSuccess={onLoginSuccess} />
        )}
      </div>
    </LocalizationProvider>
  );
  }

export default App;
