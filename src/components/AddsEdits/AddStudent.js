import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import { Grid } from '@mui/material';


function AddStudent(props) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState({});

  const handleClickOpen = () => {

      const today = new Date();
      const year = today.getFullYear();
      let month = today.getMonth() + 1;
      if (month < 10) {
        month = '0' + month;
      }
      let day = today.getDate();
      if (day < 10) {
        day = '0' + day;
      }
    
      const formattedDate = `${year}-${month}-${day}`;
    
      setStudent({
        dateAdded: formattedDate,
        mtRef: null,
        studentName: null,
        studentSurname: null,
        studentDob: '2016-06-25',
        studentGender: null,
        studentNationality: null,
        englishLevel: null,
        roomRequirements: null,
        photoPermissions: null,
        classRequirements: null,
        allergies: null,
        notes: null,
        arrivalDate: '2023-06-25',
        departureDate: '2023-08-06'
          })    
      setOpen(true);
      }
    
      // Close the modal form 
      const handleClose = () => {
        setOpen(false);
      };
      
      const handleChange = (event) => {
        setStudent({...student, 
          [event.target.name]: event.target.value});
      }
    
      const handleSave = () => {
        props.addStudent(student);
        handleClose();
      }
    
      return(
        <div>
          <IconButton onClick={handleClickOpen}><AddIcon color="primary"/></IconButton>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Add Student</DialogTitle>
              <DialogContent>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid item xs={6}>
              <TextField sx={{ mb: 0, mt: 3 }}
                    label='Date Added'
                    value={student.dateAdded}
                    onChange={handleChange}
                    fullWidth={true}
                    name="dateAdded"
                  /></Grid>
                  <Grid item xs={6}>
                  <TextField sx={{ mb: 0, mt: 3 }}
                    label='master tracker'
                    value={student.mtRef}
                    onChange={handleChange}
                    fullWidth={true}
                    name="mtRef"
                  /></Grid>
                  <Grid item xs={6}>
                <TextField sx={{ mb: 0, mt: 3 }}
                    label='Name'
                    value={student.studentName}
                    onChange={handleChange}
                    fullWidth={true}
                    name="studentName"
                    /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Surname'
                    value={student.studentSurname}
                    onChange={handleChange}
                    fullWidth={true}
                    name="studentSurname"
                  />
                  </Grid>
                  <Grid item xs={6}>
                <TextField sx={{ mb: 0, mt: 3 }}
                    label='Date Of Birth'
                    value={student.studentDob}
                    onChange={handleChange}
                    fullWidth={true}
                    name="studentDob"
                    /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Gender'
                    value={student.studentGender}
                    onChange={handleChange}
                    fullWidth={true}
                    name="studentGender"
                  /></Grid>
                  <Grid item xs={6}>
                  <TextField sx={{ mb: 0, mt: 3 }}
                    label='Nationality'
                    value={student.studentNationality}
                    onChange={handleChange}
                    fullWidth={true}
                    name="studentNationality"
                    /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='English Level'
                    value={student.englishLevel}
                    onChange={handleChange}
                    fullWidth={true}
                    name="englishLevel"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Room Requirements'
                    value={student.roomRequirements}
                    onChange={handleChange}
                    fullWidth={true}
                    name="roomRequirements"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Photo Permissions'
                    value={student.photoPermissions}
                    onChange={handleChange}
                    fullWidth={true}
                    name="photoPermissions"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Class Requirements'
                    value={student.classRequirements}
                    onChange={handleChange}
                    fullWidth={true}
                    name="classRequirements"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Allergies'
                    value={student.allergies}
                    onChange={handleChange}
                    fullWidth={true}
                    name="allergies"
                  /></Grid>
                  <Grid item xs={12}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Notes'
                    value={student.notes}
                    onChange={handleChange}
                    fullWidth={true}
                    name="notes"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Arrival'
                    value={student.arrivalDate}
                    onChange={handleChange}
                    fullWidth={true}
                    name="arrivalDate"
                  /></Grid>
                  <Grid item xs={6}>
                    <TextField sx={{ mb: 0, mt: 3 }}
                    label='Departure'
                    value={student.departureDate}
                    onChange={handleChange}
                    fullWidth={true}
                    name="departureDate"
                  /></Grid>
                  </Grid>
              </DialogContent>    
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogActions>
            </Dialog>            
        </div>
      );  
      }    
      export default AddStudent;
