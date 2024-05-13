import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField, Grid, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddStudent(props) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState({
    dateAdded: '',
    mtRef: '',
    studentName: '',
    studentSurname: '',
    studentDob: '',
    studentGender: '',
    studentNationality: '',
    englishLevel: '',
    roomRequirements: '',
    classRequirements: '',
    allergies: '',
    notes: '',
    hasAllPermission: false,
    hasPoolPermission: false,
    hasPhotoPermission: false,
    hasMedicalPermission: false,
    hasHospitalPermission: false,
    hasExcursionPermission: false,
    hasActivityPermission: false,
    hasSupervisionPermission: false,
  });

  const handleClickOpen = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let day = today.getDate();
    if (day < 10) day = '0' + day;
    
    const formattedDate = `${year}-${month}-${day}`;

    setStudent({
      ...student,
      dateAdded: formattedDate,
      studentDob: '2017-06-25',
      arrivalDate: '2024-06-30',
      departureDate: '2024-08-10'
    });
    
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    if (name === "hasAllPermission") {
      const newPermissions = {
        hasAllPermission: checked,
        hasPoolPermission: checked,
        hasPhotoPermission: checked,
        hasMedicalPermission: checked,
        hasHospitalPermission: checked,
        hasExcursionPermission: checked,
        hasActivityPermission: checked,
        hasSupervisionPermission: checked
      };

      setStudent(prevStudent => ({
        ...prevStudent,
        ...newPermissions
      }));
    } else if (type === "checkbox") {
      setStudent(prevStudent => ({
        ...prevStudent,
        [name]: checked
      }));
    } else {
      setStudent(prevStudent => ({
        ...prevStudent,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    props.addStudent(student);
    handleClose();
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <AddIcon color="primary" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Date Added'
                value={student.dateAdded}
                onChange={handleChange}
                fullWidth={true}
                name="dateAdded"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Master Tracker'
                value={student.mtRef || ''}
                onChange={handleChange}
                fullWidth={true}
                name="mtRef"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Name'
                value={student.studentName || ''}
                onChange={handleChange}
                fullWidth={true}
                name="studentName"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Surname'
                value={student.studentSurname || ''}
                onChange={handleChange}
                fullWidth={true}
                name="studentSurname"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Date Of Birth'
                value={student.studentDob}
                onChange={handleChange}
                fullWidth={true}
                name="studentDob"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Gender'
                value={student.studentGender || ''}
                onChange={handleChange}
                fullWidth={true}
                name="studentGender"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Nationality'
                value={student.studentNationality || ''}
                onChange={handleChange}
                fullWidth={true}
                name="studentNationality"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='English Level'
                value={student.englishLevel || ''}
                onChange={handleChange}
                fullWidth={true}
                name="englishLevel"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Room Requirements'
                value={student.roomRequirements || ''}
                onChange={handleChange}
                fullWidth={true}
                name="roomRequirements"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Class Requirements'
                value={student.classRequirements || ''}
                onChange={handleChange}
                fullWidth={true}
                name="classRequirements"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Allergies'
                value={student.allergies || ''}
                onChange={handleChange}
                fullWidth={true}
                name="allergies"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Notes'
                value={student.notes || ''}
                onChange={handleChange}
                fullWidth={true}
                name="notes"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ width: '100%', borderTop: '1px solid #e0e0e0', my: 2 }} />
            </Grid>
            <Grid item xs={8}>
              <Typography sx={{ mb: 0, mt: 0 }}>
                Permissions
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasAllPermission}
                    onChange={handleChange}
                    name="hasAllPermission"
                  />
                }
                label="All"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasPoolPermission}
                    onChange={handleChange}
                    name="hasPoolPermission"
                  />
                }
                label="Swimming Pool"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasPhotoPermission}
                    onChange={handleChange}
                    name="hasPhotoPermission"
                  />
                }
                label="Photography"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasMedicalPermission}
                    onChange={handleChange}
                    name="hasMedicalPermission"
                  />
                }
                label="Medical"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasHospitalPermission}
                    onChange={handleChange}
                    name="hasHospitalPermission"
                  />
                }
                label="Hospital"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasExcursionPermission}
                    onChange={handleChange}
                    name="hasExcursionPermission"
                  />
                }
                label="Excursions"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasActivityPermission}
                    onChange={handleChange}
                    name="hasActivityPermission"
                  />
                }
                label="Activity"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={student.hasSupervisionPermission}
                    onChange={handleChange}
                    name="hasSupervisionPermission"
                  />
                }
                label="Supervision"
              />
            </Grid>
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
