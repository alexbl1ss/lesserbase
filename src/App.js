import { useState, useEffect } from 'react';
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
import MyProfile from './components/MyProfile.js';



function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [showWhoIsDoing, setShowWhoIsDoing] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [username, setUsername] = useState("");
  useEffect(() => {
  document.title = 'LOCATORBASE';
}, []);

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
        <AppBar position="static">
          <Toolbar>
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                <Button color="inherit" onClick={() => setActiveTab('search')}>Search</Button>
<Button color="inherit" onClick={() => setActiveTab('groups')}>My Groups</Button>
<Button color="inherit" onClick={() => setActiveTab('profile')}>My Profile</Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated ? (
  activeTab === 'profile' ? (
    <MyProfile />
  ) : activeTab === 'groups' ? (
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
