import { useState, useEffect } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { IconButton, Menu, MenuItem, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Login from './components/Login';
import ChangePasswordDialog from './components/ChangePasswordDialog';
import StudentSearch from './components/StudentSearch';
import GroupSchedule from './components/GroupSchedule.js';
import LandingPage from './LandingPage';
import { SERVER_URL, RECOVERY_USER_EMAIL } from './constants.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en-gb';
import MyProfile from './components/MyProfile.js';
import GymTracker from './components/Gym/GymTracker';
import DailySummary from './components/DailySummary/DailySummary';
import VersionChecker from './VersionChecker';

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [username, setUsername] = useState("");
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [pwOpen, setPwOpen] = useState(false);

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

    setAccountMenuAnchor(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('bearer');
    setAuth(false);
  };

  const handlePasswordChanged = () => {
    // The backend revoked all tokens, so the session is already invalid — sign
    // out and route back to a fresh login with the new password.
    setPwOpen(false);
    handleLogout();
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
                <IconButton
                  color="inherit"
                  onClick={(e) => setAccountMenuAnchor(e.currentTarget)}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={accountMenuAnchor}
                  open={Boolean(accountMenuAnchor)}
                  onClose={() => setAccountMenuAnchor(null)}
                >
                  {username !== RECOVERY_USER_EMAIL && (
                    <MenuItem
                      onClick={() => {
                        setAccountMenuAnchor(null);
                        setPwOpen(true);
                      }}
                    >
                      Change password
                    </MenuItem>
                  )}
                  {username !== RECOVERY_USER_EMAIL && <Divider />}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
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
          ) : activeTab === 'summary' ? (
            <DailySummary />
          ) : (
            <StudentSearch showFinancials={showFinancials} />
          )
        ) : (
          <Login onLoginSuccess={onLoginSuccess} />
        )}
        <ChangePasswordDialog
          open={pwOpen}
          onClose={() => setPwOpen(false)}
          email={username}
          onPasswordChanged={handlePasswordChanged}
        />
        <VersionChecker />
      </div>
    </LocalizationProvider>
  );
}

export default App;
