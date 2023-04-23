import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Search from './components/Search.js';

import { SERVER_URL } from './constants.js';

function Login() {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setAuth] = useState(false);

  const [user, setUser] = useState({
        email: '', 
        password: ''
      });
    const [open, setOpen] = useState(false);

    const handleChange = (event) => {
        setUser({...user, [event.target.name] : event.target.value});
      }
      
      const login = () => {
        fetch(SERVER_URL + 'api/v1/auth/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.access_token);
          if (data.access_token !== undefined) {
            setAccessToken(data.access_token);
            sessionStorage.setItem('bearer', data.access_token);
            sessionStorage.setItem('isAuthenticated', true);
            setAuth(true);
          } else {
            setOpen(true);
          }
        })
        .catch(err => console.error(err));
      };        
      if (isAuthenticated) {
        console.log("authenticated")
        console.log(accessToken)
        

        return <Search 
        accessToken={accessToken}
        isAuthenticated={isAuthenticated}
        setAccessToken={setAccessToken}
        setAuth={setAuth}
          />;
      }
      else {  
        return(
        <div>
          <Stack spacing={2} alignItems='center' mt={2}>
          <TextField 
            name="email"
            label="Email" 
            onChange={handleChange} />
          <TextField 
            type="password"
            name="password"
            label="Password"
            onChange={handleChange}/>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={login}>
              Login
          </Button>
        </Stack>
        <Snackbar 
          open={open}
          autoHideDuration={3000}
          onClose={() => setOpen(false)}
          message="Login failed: Check your username and password"
        />
        </div>
      
    );
        }
}

export default Login;