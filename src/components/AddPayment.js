import React, { useState } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

function AddPayment(props) {
    const [open, setOpen] = useState(false);
    const [payment, setPayment] = useState({
        studentid: props.studentId,
        paymentamount: '',
        paymentaccount: '',
        paymentdate: ''
    });

    // Open the modal form
    const handleClickOpen = () => {
        setOpen(true);
    };
    
    // Close the modal form 
    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        props.addPayment(payment)
        .then(() => {
            props.handlePaymentAdded(); // <-- call the function to refresh PaymentsCard
            handleClose();
          })
          .catch((error) => {
            console.log(error);
          });
      
    }

    const handleChange = (event) => {
        setPayment({...payment, [event.target.name]: event.target.value});
    }
  
    return(
        <div>
            <Button variant="contained" onClick={handleClickOpen}>New Payment</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Record A Payment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}> 
                        <TextField label="Student DB ref ID" name="studentid" 
                            autoFocus 
                            variant="standard" value={payment.studentid} 
                            InputProps={{
                                readOnly: true,
                            }} />
                        <TextField label="Payment Date 2023-04-05" name="paymentdate" 
                            variant="standard" value={payment.paymentdate} 
                            onChange={handleChange}/> 
                        <TextField label="Payment Amount" name="paymentamount" 
                            variant="standard" value={payment.paymentamount} 
                            onChange={handleChange}/> 
                        <TextField label="Payment Account" name="paymentaccount" 
                            variant="standard" value={payment.paymentaccount} 
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

export default AddPayment;
