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
import { CAMPUSES, GROUPTYPES } from '../../constants';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


function AddGroup(props) {
    const [open, setOpen] = useState(false);
    const [group, setGroup] = useState({
        groupName: '',
        campus: '',
        capacity: '',
        notes: '',
        groupType: '',
    });

    const handleClickOpen = () => {
        
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        console.log(group);
        props.addGroup(group);
        handleClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setGroup((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div>
            <IconButton onClick={handleClickOpen}color="primary"> <AddIcon/></IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Group</DialogTitle>
                <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={2} mt={1}>
                        <FormControl>
                            <InputLabel id="campus-label">Campus</InputLabel>
                            <TextField label="Name" name="groupName" 
                                variant="standard" value={group.groupName} 
                                onChange={handleChange}/> 
                            <Select
                                labelId="campus"
                                id="campus"
                                name="campus"
                                value={group.campus}
                                onChange={handleChange}
                                label="Campus"
                            >
                                {CAMPUSES.map((campus) => (
                                    <MenuItem key={campus.value} value={campus.value}>
                                        {campus.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField label="Capacity" name="capacity" 
                                variant="standard" value={group.capacity} 
                                onChange={handleChange}/> 
                            <TextField label="Notes" name="notes" 
                                variant="standard" value={group.notes} 
                                onChange={handleChange}/> 
                            <Select
                                labelId="groupType"
                                id="groupType"
                                name="groupType"
                                value={group.groupType}
                                onChange={handleChange}
                                label="Type"
                            >
                                {GROUPTYPES.map((groupType) => (
                                    <MenuItem key={groupType.value} value={groupType.value}>
                                        {groupType.label}
                                    </MenuItem>
                                ))}
                            <TextField label="Notes" name="notes" 
                                variant="standard" value={group.notes} 
                                onChange={handleChange}/> 
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

export default AddGroup;
