import React, { useState } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ACCOUNTS } from '../../constants';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


function AddPayment(props) {

    const [open, setOpen] = useState(false);
    const [payment, setPayment] = useState({
        studentId: props.studentId,
        paymentamount: '',
        paymentaccount: '',
        paymentdate: ''
    });

    // Open the modal form
    const handleClickOpen = () => {
        setPayment(prevPayment => ({
            paymentDate: new Date(),
            studentId: props.studentId
        }))
        setOpen(true);
    };
    
    // Close the modal form 
    const handleClose = () => {
        setOpen(false);
    };

    const handleDateChange = (date, name) => {
        setPayment(prevStay => ({
          ...prevStay,
          [name]: date
        }));
      };
    
    const handleChange = (event) => {
        const { name, value } = event.target;
        setPayment((prevPayment) => ({
            ...prevPayment,
            [name]: value,
        }));
    };


    const handleSave = () => {
        props.addPayment(payment)
        handleClose();
    }

    return(
        <div>
            <IconButton onClick={handleClickOpen}color="primary"> <AddIcon/></IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Record A Payment</DialogTitle>
                <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={2} mt={1}> 
                        <TextField label="Student DB ref ID" name="studentId" 
                            autoFocus
                            variant="standard" value={payment.studentId} 
                            InputProps={{
                                readOnly: true,
                            }} />
                        <DatePicker
                            label="Payment Date"
                            value={payment.date}
                            onChange={(date) => handleDateChange(date, 'paymentdate')}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                sx={{ mb: 0, mt: 0 }}
                            />
                            )}
                        /><TextField label="Payment Amount (£)" name="paymentamount" 
                            variant="standard" value={payment.paymentamount} 
                            onChange={handleChange}/> 
                        <FormControl>
                            <InputLabel id="account-label">Account</InputLabel>
                            <Select
                                labelId="account-label"
                                id="paymentaccount"
                                name="paymentaccount"
                                value={payment.paymentamount}
                                onChange={handleChange}
                                label="paymentamount"
                            >
                                {ACCOUNTS.map((account) => (
                                    <MenuItem key={account.value} value={account.value}>
                                        {account.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl> 
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

export default AddPayment;
