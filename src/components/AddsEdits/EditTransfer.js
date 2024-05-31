import React, { useState, useEffect } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
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
import { SERVER_URL } from '../../constants.js';

function EditTransfer(props) {
  const [open, setOpen] = useState(false);
  const { person_id, transfer_id, transferDate } = props;
  const currentHour = new Date();
  currentHour.setMinutes(0);
  currentHour.setSeconds(0);  
  currentHour.setMilliseconds(0);

  const [transfer, setTransfer] = useState({
    direction: 'IN',
    transferDate: transferDate || currentHour,
    depart: '', 
    arrive: '',
    privatePickup: false,
    departureTime: currentHour,
    arrivalTime: currentHour,
    flightId: ''
  });

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const token = sessionStorage.getItem('bearer');
        const response = await fetch(`${SERVER_URL}api/transfers/${person_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const selectedTransfer = data.find((transfer) => transfer.id === transfer_id);
        
        if (selectedTransfer) {
          setTransfer({
            direction: selectedTransfer.direction || 'IN', // Default to 'IN' if undefined
            transferDate: selectedTransfer.transferDate ? new Date(selectedTransfer.transferDate) : currentHour,
            depart: selectedTransfer.depart || '', // Default to empty string if undefined
            arrive: selectedTransfer.arrive || '', // Default to empty string if undefined
            privatePickup: selectedTransfer.privatePickup || false, // Default to false if undefined
            departureTime: selectedTransfer.departureTime ? new Date(`1970-01-01T${selectedTransfer.departureTime}`) : currentHour,
            arrivalTime: selectedTransfer.arrivalTime ? new Date(`1970-01-01T${selectedTransfer.arrivalTime}`) : currentHour,
            flightId: selectedTransfer.flightId || '' // Default to empty string if undefined
          });
        } else {
          // Handle case where no transfer is found or the data array is empty
          setTransfer({
            direction: 'IN',
            transferDate: currentHour,
            depart: '',
            arrive: '',
            privatePickup: false,
            departureTime: currentHour,
            arrivalTime: currentHour,
            flightId: ''
          });
        }
      } catch (error) {
        console.error('Error fetching transfer:', error);
        // Initialize with default values in case of error
        setTransfer({
          direction: 'IN',
          transferDate: new Date(),
          depart: '',
          arrive: '',
          privatePickup: false,
          departureTime: new Date(),
          arrivalTime: new Date(),
          flightId: ''
        });
      }
    };
  
    if (open) {
      fetchTransfer();
    }
  }, [open, person_id, transfer_id]);
    

const handleClickOpen = () => {
    setOpen(true);
};

  const handleClose = () => {
    setOpen(false);
  };
      
  const handleDateChange = (date, name) => {
    setTransfer(prevTransfer => ({
      ...prevTransfer,
      [name]: date
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
                  
    props.editTransfer(formattedData, transfer_id);
    handleClose();            
  };
                 
  return(
    <div>
      <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit Transfer</DialogTitle>
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
              value={transfer.transferDate || new Date()}
              onChange={(date) => handleDateChange(date, 'transferDate')}
              renderInput={(params) => <TextField {...params} />}
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
              renderInput={(params) => <TextField {...params} />}
            />
            <TimePicker
              label="Arrival Time"
              value={transfer.arrivalTime}
              onChange={(time) => handleDateChange(time, 'arrivalTime')}
              renderInput={(params) => <TextField {...params} />}
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
export default EditTransfer;