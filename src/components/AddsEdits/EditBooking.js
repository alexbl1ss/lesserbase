import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { STATUS } from '../../constants';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function EditBooking(props) {
  const { passedBooking } = props;
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState({
    bookingId: '',
    actualCharge: '',
    bookingStatus: '',
    notes: '',
    startDate: null,
    endDate: null
  });
  const [datesEnabled, setDatesEnabled] = useState(false);

  useEffect(() => {
    if (passedBooking) {
      const safeDate = (dateString) => {
        // Only create a new Date object if dateString is not null
        return dateString ? new Date(dateString) : null;
      };

      setBooking({
        bookingId: passedBooking.bookingId,
        actualCharge: passedBooking.actualCharge,
        bookingStatus: passedBooking.bookingStatus,
        notes: passedBooking.notes,
        startDate: safeDate(passedBooking.startDate),
        endDate: safeDate(passedBooking.endDate)
      });
    }
  }, [passedBooking]);
      
  const handleDateChange = (date, name) => {
    setBooking(prevBooking => ({
      ...prevBooking,
      [name]: date
    }));
  };

  const handleChange = (event) => {
    setBooking({
      ...booking,
      [event.target.name]: event.target.value
    });
  };

  const toggleDatesEnabled = (event) => {
    setDatesEnabled(event.target.checked);
  };
          
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleSave = () => {
    props.editBooking(booking, passedBooking.bookingId);
    handleClose();
  }
    
  return (
    <div>
      <IconButton onClick={() => setOpen(true)}><EditIcon color="primary"/></IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <TextField label="Actual Charge (£)" name="actualCharge" type="number" value={booking.actualCharge} onChange={handleChange} variant="standard" />
              <FormControl fullWidth>
                <InputLabel id="booking-status-label">Booking Status</InputLabel>
                <Select
                  labelId="booking-status-label"
                  id="booking-status"
                  name="bookingStatus"
                  value={booking.bookingStatus}
                  onChange={handleChange}
                  label="Booking Status"
                >
                  {STATUS.map(status => (
                    <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Notes" name="notes" value={booking.notes} onChange={handleChange} variant="standard" />
              <DatePicker
                label="Start Date"
                value={booking.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={booking.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );  
      }    
      export default EditBooking;
