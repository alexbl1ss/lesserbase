import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';


function EditAgent(props) {
  const [open, setOpen] = useState(false);
  const { passedAgent } = props;
  const [agent, setAgent] = useState({
    agentType: passedAgent.agentType,
    agentName: passedAgent.agentName,
    email: passedAgent.email,
    phone: passedAgent.phone,
    englishSpeaking: passedAgent.englishSpeaking,
    commission: passedAgent.commission,
    commissionRate: passedAgent.commissionRate,
    residential: passedAgent.residential,
    arrivalDate: passedAgent.arrivalDate,
    departureDate: passedAgent.departureDate
});

    // Open the modal form and update the car state
    const handleClickOpen = () => {
        setAgent({
          agentType: passedAgent.agentType,
          agentName: passedAgent.agentName,
          email: passedAgent.email,
          phone: passedAgent.phone,
          englishSpeaking: passedAgent.englishSpeaking,
          commission: passedAgent.commission,
          commissionRate: passedAgent.commissionRate,
          residential: passedAgent.residential,
          arrivalDate: passedAgent.arrivalDate,
          departureDate: passedAgent.departureDate
              })      
        setOpen(true);
      }
    
      // Close the modal form 
      const handleClose = () => {
        setOpen(false);
      };
      
      const handleChange = (event) => {
        setAgent({...agent, 
          [event.target.name]: event.target.value});
      }
    
      // Update car and close modal form 
      const handleSave = () => {
        props.editAgent(agent, passedAgent.id);
        handleClose();
      }
    
      return(
        <div>
          <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}> 
                <TextField label="agentName" name="agentName" 
                    variant="standard" value={agent.agentName} 
                    onChange={handleChange}/> 
                  <TextField label="GROSS/NET/NONE" name="commission" 
                    variant="standard" value={agent.commission} 
                    onChange={handleChange}/> 
                  <TextField label="commissionRate" name="commissionRate" 
                    variant="standard" type="number" value={agent.commissionRate} 
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
      export default EditAgent;
