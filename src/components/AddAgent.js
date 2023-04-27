import React, { useState } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import  Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/Stack';

function AddAgent(props) {
    const [open, setOpen] = useState(false);
    const [agent, setAgent] = useState({
      agentType: 'AGENT',
      agentName: '',
      email: true,
      phone: true,
      englishSpeaking: true,
      commission: '',
      commissionRate: '',
      residential: false,
      arrivalDate: null,
      departureDate: null
  });

  // Open the modal form
  const handleClickOpen = () => {
    setOpen(true);
  };
    
  // Close the modal form 
  const handleClose = () => {
    setOpen(false);
  };

  // Save car and close modal form 
  const handleSave = () => {
    props.addAgent(agent);
    handleClose();
  }

  const handleChange = (event) => {
    setAgent({...agent, [event.target.name]: event.target.value});
  }
  
  return(
    <div>
      <Button variant="contained" onClick={handleClickOpen}>New Agent</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Agent</DialogTitle>
        <DialogContent>
        <Stack spacing={2} mt={1}> 
                  <TextField label="agentName" name="agentName" 
                    variant="standard" value={agent.agentName} 
                    onChange={handleChange}/> 
                  <TextField label="GROSS/NET/NONE" name="commission" 
                    variant="standard" value={agent.commission} 
                    onChange={handleChange}/> 
                  <TextField label="commissionRate" name="commissionRate" 
                    variant="standard" value={agent.commissionRate} 
                    onChange={handleChange}/> 
                </Stack>
        </DialogContent>
        <DialogActions>
           <Button onClick={handleClose}>Cancel</Button>
           <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>            
    </div>
    );
}

export default AddAgent;