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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


function EditTransfer(props) {
  const [open, setOpen] = useState(false);
  const { passedTransfer } = props;
  const [transfer, setTransfer] = useState({
    direction: passedTransfer.direction,
    transferDate: passedTransfer.transferDate,
    depart: passedTransfer.depart,
    arrive: passedTransfer.arrive,
    privatePickup: passedTransfer.privatePickup,
    departureTime: passedTransfer.departureTime,
    arrivalTime: passedTransfer.arrivalTime,
    flightId: passedTransfer.flightId
  });

    // Open the modal form and update the booking 
    const handleClickOpen = () => {
      setTransfer({
          direction: passedTransfer.direction,
          transferDate: passedTransfer.transferDate,
          depart: passedTransfer.depart,
          arrive: passedTransfer.arrive,
          privatePickup: passedTransfer.privatePickup,
          departureTime: passedTransfer.departureTime,
          arrivalTime: passedTransfer.arrivalTime,
          flightId: passedTransfer.flightId
      })      
      setOpen(true);
    }
    
      // Close the modal form 
      const handleClose = () => {
        setOpen(false);
      };
      
      const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
      
        // Update the privatePickup value based on the checkbox state
        const updatedValue = type === 'checkbox' ? checked : value;
      
        setTransfer({ ...transfer, [name]: updatedValue });
      };
            // Update booking and close modal form 
      const handleSave = () => {
        props.editTransfer(transfer, passedTransfer.id);
        handleClose();
      }
    
      return(
        <div>
          <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit Transfer</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}> 
                <TextField label="Direction" name="direction" 
                     variant="standard" type="number" value={transfer.direction}  
                    onChange={handleChange}/> 
                  <TextField label="Date" name="transferDate" 
                    variant="standard" value={transfer.transferDate} 
                    onChange={handleChange}/> 
                  <TextField label="Leaving" name="depart" 
                    variant="standard" value={transfer.depart} 
                    onChange={handleChange}/> 
                  <TextField label="Arriving" name="arrive" 
                    variant="standard" value={transfer.arrive} 
                    onChange={handleChange}/> 
<FormControlLabel
  control={
    <Checkbox
      name="privatePickup"
      checked={transfer.privatePickup}
      onChange={handleChange}
    />
  }
  label="Self Transfer"
/>                  <TextField label="Depart" name="departureTime" 
                    variant="standard" value={transfer.departureTime} 
                    onChange={handleChange}/> 
                  <TextField label="Arrive" name="arrivalTime" 
                    variant="standard" value={transfer.arrivalTime} 
                    onChange={handleChange}/> 
                  <TextField label="Flight" name="flightId" 
                    variant="standard" value={transfer.flightId} 
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
      export default EditTransfer;
