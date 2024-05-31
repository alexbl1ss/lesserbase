import React, { useState, useEffect } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

function AddTransfer(props) {
  const [open, setOpen] = useState(false);
  const { direction, passedStudent, transferDate } = props;
  const currentHour = new Date();
  currentHour.setMinutes(0);
  currentHour.setSeconds(0);  
  currentHour.setMilliseconds(0);

  const [transfer, setTransfer] = useState({
    direction: direction || 'IN',
    transferDate: transferDate || currentHour,
    depart: '', 
    arrive: '',
    privatePickup: false,
    departureTime: currentHour,
    arrivalTime: currentHour,
    flightId: ''
  });
  
  useEffect(() => {
    
  setTransfer({
      direction: direction || 'IN',
      transferDate: transferDate,
      depart: null,
      arrive: null,
      privatePickup: null,
      departureTime: null,
      arrivalTime: null,
      flightId: null
    });
  }, [direction, passedStudent, transferDate]);
  

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (date, name) => {
    setTransfer(prevTransfer => ({
      ...prevTransfer,
      [name]: date || new Date()  // Fallback to a new Date if date is null
    }));
  };
  
  
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    setTransfer({ ...transfer, [name]: updatedValue });
  };

  const handleSave = () => {
    const formattedData = {
      ...transfer,
      transferDate: transfer.transferDate ? format(new Date(transfer.transferDate), 'yyyy-MM-dd') : null,
      departureTime: transfer.departureTime ? format(new Date(transfer.departureTime), 'HH:mm:ss') : null,
      arrivalTime: transfer.arrivalTime ? format(new Date(transfer.arrivalTime), 'HH:mm:ss') : null,
    };
    
    props.addTransfer(formattedData, passedStudent.studentId);
    handleClose();
  };
  
  return(
    <div>
      <IconButton color="primary" onClick={handleClickOpen}>
        <AddIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Transfer</DialogTitle>
        <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <DatePicker
                label="Date"
                value={transfer.transferDate}
                onChange={(date) => handleDateChange(date, 'transferDate')}
                renderInput={(params) => <TextField {...params} value={params.inputProps.value || ''} />}
            />
            <TextField label="Departure Airport" name="depart" 
              variant="standard" value={transfer.depart} 
              onChange={handleChange}/> 
            <TextField label="Arrival Airport" name="arrive" 
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
            <TimePicker
                  label="Departure Time"
                  value={transfer.departureTime}
                  onChange={(time) => handleDateChange(time, 'departureTime')}
                  renderInput={(params) => <TextField {...params} value={params.inputProps.value || ''} />}
              />
              <TimePicker
                  label="Arrival Time"
                  value={transfer.arrivalTime}
                  onChange={(time) => handleDateChange(time, 'arrivalTime')}
                  renderInput={(params) => <TextField {...params} value={params.inputProps.value || ''} />}
              /> 
            <TextField label="Flight Number" name="flightId" 
              variant="standard" value={transfer.flightId} 
              onChange={handleChange}/> 
          </Stack>
        </LocalizationProvider>
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
