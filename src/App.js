import { useState, useEffect } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Login from './components/Login';
import StudentSearch from './components/StudentSearch';
import GroupSchedule from './components/GroupSchedule.js';
import LandingPage from './LandingPage';
import { SERVER_URL } from './constants.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';
import MyProfile from './components/MyProfile.js';
import GymTracker from './components/Gym/GymTracker';
import VersionChecker from './VersionChecker';

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [username, setUsername] = useState("");

  useEffect(() => {
    document.title = 'LOCATORBASE';
  }, []);

  const onLoginSuccess = (username, role) => {
    setUsername(username);
    setShowFinancials(role === 'ADMIN');
    setAuth(true);
    setActiveTab('landing');
  };

  const handleLogout = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => console.error(err));

    sessionStorage.removeItem('isAuthenticated');
    setAuth(false);
  };

  const handleLandingSelect = (key) => {
    setActiveTab(key);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IconButton color="inherit" onClick={() => setActiveTab('landing')}>
                  <HomeIcon />
                </IconButton>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {isAuthenticated ? (
          activeTab === 'landing' ? (
            <LandingPage onSelect={handleLandingSelect} />
          ) : activeTab === 'profile' ? (
            <MyProfile />
          ) : activeTab === 'groups' ? (
            <GroupSchedule username={username} />
          ) : activeTab === 'gym' ? (
            <GymTracker />
          ) : (
            <StudentSearch showFinancials={showFinancials} />
          )
        ) : (
          <Login onLoginSuccess={onLoginSuccess} />
        )}
        <VersionChecker />
      </div>
    </LocalizationProvider>
  );
}

export default App;
