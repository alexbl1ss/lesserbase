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
    bookingStatus: passedBooking.bookingStatus,
    notes: passedBooking.notes,
    startDate: passedBooking.startDate,
    endDate: passedBooking.endDate
});

    // Open the modal form and update the booking 
    const handleClickOpen = () => {
        setBooking({
          bookingId: passedBooking.bookingId,
          actualCharge: passedBooking.actualCharge,
          bookingStatus: passedBooking.bookingStatus,
          notes: passedBooking.notes,
          startDate: passedBooking.startDate,
          endDate: passedBooking.endDate
              })      
        setOpen(true);
      }
    
      // Close the modal form 
      const handleClose = () => {
        setOpen(false);
      };
      
      const handleChange = (event) => {
        console.log("handlingChange : " + event.target.name)
        const value = event.target.name === 'actualCharge'
          ? parseFloat(event.target.value)
          : event.target.value;
      
        setBooking({...booking, [event.target.name]: value});
      }
          
      // Update booking and close modal form 
      const handleSave = () => {
        props.editBooking(booking, passedBooking.bookingId);
        handleClose();
      }
    
      return(
        <div>
          <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}> 
                <TextField label="actualCharge" name="actualCharge" 
                     variant="standard" type="number" value={booking.actualCharge}  
                    onChange={handleChange}/> 
                  <TextField label="PROVISIONAL,CONFIRMED,PAID" name="bookingStatus" 
                    variant="standard" value={booking.bookingStatus} 
                    onChange={handleChange}/> 
                  <TextField label="notes" name="notes" 
                    variant="standard" value={booking.notes} 
                    onChange={handleChange}/> 
                  <TextField label="Custom Start 2023-04-05" name="startDate" 
                    variant="standard" value={booking.startDate} 
                    onChange={handleChange}/> 
                  <TextField label="Custom End 2023-04-05" name="endDate" 
                    variant="standard" value={booking.endDate} 
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
