import React, { useState } from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add'; // Import Add Icon
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI
import { CAMPUSES } from '../../constants'; // Import your campuses


function AddStay(props) {
    const [open, setOpen] = useState(false);
    const { passedStudent } = props;
    const [stay, setStay] = useState({
        campus: '',
        arrivalDate: '',
        departureDate: '',
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        console.log(passedStudent);
        console.log(stay);
        props.addStay(stay, passedStudent.id);
        handleClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStay((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div>
            <IconButton onClick={handleClickOpen}color="primary"> <AddIcon/></IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Stay</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <FormControl>
                            <InputLabel id="campus-label">Campus</InputLabel>
                            <Select
                                labelId="campus-label"
                                id="campus"
                                name="campus"
                                value={stay.campus}
                                onChange={handleChange}
                                label="Campus"
                            >
                                {CAMPUSES.map((campus) => (
                                    <MenuItem key={campus.value} value={campus.value}>
                                        {campus.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Arrive" 
                            name="arrivalDate" 
                            variant="standard" 
                            value={stay.arrivalDate} 
                            onChange={handleChange}
                        /> 
                        <TextField 
                            label="Depart" 
                            name="departureDate" 
                            variant="standard" 
                            value={stay.departureDate} 
                            onChange={handleChange}
                        /> 
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

export default AddStay;
