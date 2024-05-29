import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';

import { SERVER_URL } from '../constants.js';

function Login(props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState('');

  const [user, setUser] = useState({
    email: '', 
    password: ''
  });
  
  const handleChange = (event) => {
    setUser({...user, [event.target.name] : event.target.value});
    if (event.target.name === 'email') {
      setUsername(event.target.value);
    }
  }
      
  const login = () => {
    fetch(SERVER_URL + 'api/v1/auth/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
      if (data.access_token !== undefined) {
        //setAccessToken(data.access_token);
        sessionStorage.setItem('bearer', data.access_token);
        sessionStorage.setItem('isAuthenticated', true);
        setMessage('Login successful!');
        setIsError(false);
        setOpen(true);
        props.onLoginSuccess(username);
      } else {
        setMessage('Login failed: Check your username and password');
        setIsError(true);
        setOpen(true);
          }
    })
    .catch(err => console.error(err));
  };        
  
  return (
    <div>
      <Stack spacing={2} alignItems="center" mt={2}>
        <TextField name="email" label="Email" onChange={handleChange} />
        <TextField
          type="password"
          name="password"
          label="Password"
          onChange={handleChange}
        />
        <Button variant="outlined" color="primary" onClick={login}>
          Login
        </Button>
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          style: { backgroundColor: isError ? '#f44336' : '#4caf50' },
        }}
      />
    </div>
  );
  }

export default Login;