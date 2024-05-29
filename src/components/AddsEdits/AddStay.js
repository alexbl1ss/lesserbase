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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


function AddStay(props) {
    const [open, setOpen] = useState(false);
    const { passedStudent } = props;
    const [stay, setStay] = useState({
        campus: '',
        arrivalDate: new Date(),
        departureDate: new Date(),
    });

    const handleClickOpen = () => {
        setStay(prevStay => ({
            ...prevStay,
            arrivalDate: new Date('2024-06-30'),
            departureDate: new Date('2024-08-10')
          }));
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

    const handleDateChange = (date, name) => {
        setStay(prevStay => ({
          ...prevStay,
          [name]: date
        }));
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                        <DatePicker
                            label="Arrive"
                            value={stay.arrivalDate}
                            onChange={(date) => handleDateChange(date, 'arrivalDate')}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                sx={{ mb: 0, mt: 0 }}
                            />
                            )}
                        />
                        <DatePicker
                            label="Depart"
                            value={stay.departureDate}
                            onChange={(date) => handleDateChange(date, 'departureDate')}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                sx={{ mb: 0, mt: 0 }}
                            />
                            )}
                        />
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

export default AddStay;
