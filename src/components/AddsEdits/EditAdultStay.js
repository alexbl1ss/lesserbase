import React, { useState, useEffect } from 'react';
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
import { CAMPUSES } from '../../constants';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


function EditAdultStay(props) {
    const { adultStayToEdit, updateAdultStay, open, onClose, adultId } = props;
    const [stay, setStay] = useState({
        campus: '',
        arrivalDate: new Date(),
        departureDate: new Date(),
        residential: false,
    });

    useEffect(() => {
        if (adultStayToEdit) {
            const safeDate = (dateString) => {
                const date = new Date(dateString);
                return date instanceof Date && !isNaN(date) ? date : new Date();
              };
        
            setStay({
                campus: adultStayToEdit.campus,
                arrivalDate: safeDate(adultStayToEdit.arrivalDate),
                departureDate: safeDate(adultStayToEdit.departureDate),
                residential: adultStayToEdit.residential === "Yes",
            });
        }
    }, [adultStayToEdit]);

    const handleSave = () => {
        const stayForServer = {
            ...stay,
            residential: stay.residential ? "Yes" : "No"
        };
        updateAdultStay(stay, adultId, adultStayToEdit.stayId);
        onClose();
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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Stay</DialogTitle>
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={stay.residential}
                                    onChange={(event) => setStay(prevStay => ({
                                        ...prevStay,
                                        residential: event.target.checked
                                    }))}
                                name="residential"
                                color="primary"
                                />
                            }
                            label="Residential"
                        />
                    </Stack>
                    </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditAdultStay;
