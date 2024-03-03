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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SERVER_URL } from '../../constants.js';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function EditTransfer(props) {
  const [open, setOpen] = useState(false);
  const { person_id, transfer_id } = props;

  // Retrieve transfer data from the API based on person_id and transfer_id
  const [transfer, setTransfer] = useState({});
  useEffect(() => {
    console.log(person_id, transfer_id)
    const fetchTransfer = async () => {
      try {
        const token = sessionStorage.getItem('bearer');
        const response = await fetch(`${SERVER_URL}api/transfers/${person_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const selectedTransfer = data.find((transfer) => transfer.id === transfer_id);
        if (selectedTransfer) {
          setTransfer(selectedTransfer);
        }
      } catch (error) {
        console.error('Error fetching transfer:', error);
      }
    };

    if (open) {
      fetchTransfer();
    }
  }, [open, person_id, transfer_id]);

  // Log the updated value of `transfer` for debugging
  useEffect(() => {
    console.log('Updated transfer:', transfer);
  }, [transfer]);


  // Open the modal form and update the booking
  const handleClickOpen = () => {
    console.log("anything happening?"+ person_id + "," + transfer_id)
    setOpen(true);
  };

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
                  props.editTransfer(transfer, transfer_id);
                  handleClose();
                };
                 
      return(
        <div>
          <IconButton onClick={handleClickOpen}><EditIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Edit Transfer</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}> 
                <TextField
              label="Direction"
              name="direction"
              variant="standard"
              value={transfer.direction}
              onChange={handleChange}
              select
              InputLabelProps={{
                shrink: !!transfer.direction,
              }}
            >
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
            </TextField>
                 <TextField label="Date" name="transferDate" 
                    variant="standard" value={transfer.transferDate} 
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.transferDate,
                    }}/> 
                  <TextField label="Leaving" name="depart" 
                    variant="standard" value={transfer.depart} 
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.depart,
                    }}/> 
                  <TextField label="Arriving" name="arrive" 
                    variant="standard" value={transfer.arrive} 
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.arrive,
                    }}/> 
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
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.departureTime,
                    }}/> 
                  <TextField label="Arrive" name="arrivalTime" 
                    variant="standard" value={transfer.arrivalTime} 
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.arrivalTime,
                    }}/> 
                  <TextField label="Flight" name="flightId" 
                    variant="standard" value={transfer.flightId} 
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: !!transfer.flightId,
                    }}/> 
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