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


function EditBooking(props) {
  const [open, setOpen] = useState(false);
  const { passedBooking } = props;
  const [booking, setBooking] = useState({
    bookingId: passedBooking.bookingId,
    actualCharge: passedBooking.actualCharge,
    bookingStatus: passedBooking.bookingStatus
});

    // Open the modal form and update the car state
    const handleClickOpen = () => {
        setBooking({
          bookingId: passedBooking.bookingId,
          actualCharge: passedBooking.actualCharge,
          bookingStatus: passedBooking.bookingStatus
        })      
        setOpen(true);
      }
    
      // Close the modal form 
      const handleClose = () => {
        setOpen(false);
      };
      
      const handleChange = (event) => {
        const value = event.target.name === 'actualCharge'
          ? parseFloat(event.target.value)
          : event.target.value;
      
        setBooking({...booking, [event.target.name]: value});
      }
          
      // Update car and close modal form 
      const handleSave = () => {
        props.editBooking(booking, passedBooking.bookingId);
        handleClose();
      }
    
      return(
        <div>
          <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit car</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}> 
                <TextField label="actualCharge" name="actualCharge" 
                    variant="standard" value={booking.actualCharge} 
                    onChange={handleChange}/> 
                  <TextField label="PROVISIONAL,CONFIRMED,PAID" name="bookingStatus" 
                    variant="standard" value={booking.bookingStatus} 
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
      export default EditBooking;
