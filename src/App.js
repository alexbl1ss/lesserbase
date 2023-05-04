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

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(true);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);


  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    setAuth(authStatus === 'true');
  }, []);

  const onLoginSuccess = () => {
    setShowStudentSearch(false);
    setAuth(true);
  };

  return (
    <div className="App">
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
  );
      }

export default App;
