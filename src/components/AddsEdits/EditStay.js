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
import { CAMPUSES } from '../../constants'; // Import your campuses


function EditStay(props) {
    const { passedStudent, selectedStay, open, onClose, editStay } = props;
    const [stay, setStay] = useState({
        campus: '',
        arrivalDate: '',
        departureDate: '',
    });

    useEffect(() => {
        if (selectedStay) {
            setStay({
                campus: selectedStay.campus,
                arrivalDate: selectedStay.arrivalDate,
                departureDate: selectedStay.departureDate,
            });
        }
    }, [selectedStay]);

    const handleSave = () => {
        console.log(passedStudent);
        console.log(stay);
        editStay(stay, passedStudent.id, selectedStay.stayId);
        onClose();
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditStay;
