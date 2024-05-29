import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField, Grid, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AddStudent(props) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState({
    dateAdded: new Date(),
    mtRef: '',
    studentName: '',
    studentSurname: '',
    studentDob: new Date('2017-06-25'),
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
    setStudent(prevStudent => ({
      ...prevStudent,
      dateAdded: today,
      studentDob: new Date('2017-06-25'),
      arrivalDate: new Date('2024-06-30'),
      departureDate: new Date('2024-08-10')
    }));
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleDateChange = (date, name) => {
    setStudent(prevStudent => ({
      ...prevStudent,
      [name]: date
    }));
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 2 }}>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <DatePicker
              label="Date Added"
              value={student.dateAdded}
              onChange={(date) => handleDateChange(date, 'dateAdded')}
              renderInput={(params) => (
                <TextField
                {...params}
                fullWidth
                sx={{ mb: 0, mt: 0 }}
              />
              )}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Master Tracker ID"
            value={student.mtRef || ''}
            onChange={handleChange}
            fullWidth
            name="mtRef"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Name"
            value={student.studentName || ''}
            onChange={handleChange}
            fullWidth
            name="studentName"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Surname"
            value={student.studentSurname || ''}
            onChange={handleChange}
            fullWidth
            name="studentSurname"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <DatePicker
              label="Student Date Of Birth"
              value={student.studentDob}
              onChange={(date) => handleDateChange(date, 'studentDob')}
              renderInput={(params) => (
                <TextField
                {...params}
                fullWidth
                sx={{ mb: 0, mt: 0 }}
              />
              )}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Gender"
            value={student.studentGender || ''}
            onChange={handleChange}
            fullWidth
            name="studentGender"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Nationality"
            value={student.studentNationality || ''}
            onChange={handleChange}
            fullWidth
            name="studentNationality"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="English Level"
            value={student.englishLevel || ''}
            onChange={handleChange}
            fullWidth
            name="englishLevel"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Room Requirements"
            value={student.roomRequirements || ''}
            onChange={handleChange}
            fullWidth
            name="roomRequirements"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Class Requirements"
            value={student.classRequirements || ''}
            onChange={handleChange}
            fullWidth
            name="classRequirements"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Allergies"
            value={student.allergies || ''}
            onChange={handleChange}
            fullWidth
            name="allergies"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label="Notes"
            value={student.notes || ''}
            onChange={handleChange}
            fullWidth
            name="notes"
            sx={{ mb: 0, mt: 0 }}
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

export default AddStudent;
