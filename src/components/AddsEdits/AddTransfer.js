import React, { useState } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function AddTransfer(props) {

  const [open, setOpen] = useState(false);
  const { direction, passedStudent } = props;
  const [transfer, setTransfer] = useState(() => {
  const defaultTransferDate =
    
    direction === 'IN' ? passedStudent.arrivalDate : passedStudent.departureDate;
    
    return {
      direction: direction || 'IN',
      transferDate: defaultTransferDate,
      depart: null,
      arrive: null,
      privatePickup: null,
      departureTime: null,
      arrivalTime: null,
      flightId: null,
    };
  });

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    console.log(passedStudent)
    props.addTransfer(transfer, passedStudent.id)
    handleClose();
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
      
    const updatedValue = type === 'checkbox' ? checked : value;
      
    setTransfer({ ...transfer, [name]: updatedValue });
  };
  
  return(
    <div>
      <Button variant="contained" onClick={handleClickOpen}>Add Transfer {direction}</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Transfer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}> 
            <FormControl>
              <InputLabel id="direction-label">Direction</InputLabel>
              <Select
                labelId="direction-label"
                id="direction"
                name="direction"
                value={transfer.direction}
                onChange={handleChange}
                >
                <MenuItem value="IN">IN</MenuItem>
                <MenuItem value="OUT">OUT</MenuItem>
              </Select>
            </FormControl>                  
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
            />                  
            <TextField label="Depart" name="departureTime" 
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

export default AddTransfer;
