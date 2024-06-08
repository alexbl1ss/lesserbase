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
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { ROLES } from '../../constants';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


function AddAdult(props) {
    const [open, setOpen] = useState(false);
    const [adult, setAdult] = useState({
        adultName: '',
        adultSurname: '',
        adultGender: '',
        allergies: '',
        role: '',
        notes: '',
    });

    const handleClickOpen = () => {
        
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        console.log(adult);
        props.addAdult(adult);
        handleClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setAdult((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div>
            <IconButton onClick={handleClickOpen}color="primary"> <AddIcon/></IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Adult</DialogTitle>
                <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={2} mt={1}>
                        <FormControl>
                            <InputLabel id="campus-label">Campus</InputLabel>
                            <TextField label="Name" name="adultName" 
                                variant="standard" value={adult.adultName} 
                                onChange={handleChange}/> 
                            <TextField label="Surname" name="adultSurname" 
                                variant="standard" value={adult.adultSurname} 
                                onChange={handleChange}/> 
                            <TextField label="Gender" name="adultGender" 
                                variant="standard" value={adult.adultGender} 
                                onChange={handleChange}/> 
                            <TextField label="Allergies" name="allergies" 
                                variant="standard" value={adult.allergies} 
                                onChange={handleChange}/> 
                            <Select
                                labelId="role"
                                id="role"
                                name="role"
                                value={adult.role}
                                onChange={handleChange}
                                label="Role"
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField label="Notes" name="notes" 
                                variant="standard" value={adult.notes} 
                                onChange={handleChange}/> 
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

export default AddAdult;
