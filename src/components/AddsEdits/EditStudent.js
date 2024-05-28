import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField, Grid, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function EditStudent(props) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState({
    id: '',
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

  useEffect(() => {
    if (props.passedStudent) {
      const safeDate = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) ? date : new Date(); // Default to current date if invalid
      };
  
      setStudent({
        id: props.passedStudent.id,
        dateAdded: safeDate(props.passedStudent.dateAdded),
        mtRef: props.passedStudent.mtRef || '',
        studentName: props.passedStudent.studentName || '',
        studentSurname: props.passedStudent.studentSurname || '',
        studentDob: safeDate(props.passedStudent.studentDob),
        studentGender: props.passedStudent.studentGender || '',
        studentNationality: props.passedStudent.studentNationality || '',
        englishLevel: props.passedStudent.englishLevel || '',
        roomRequirements: props.passedStudent.roomRequirements || '',
        classRequirements: props.passedStudent.classRequirements || '',
        allergies: props.passedStudent.allergies || '',
        notes: props.passedStudent.notes || '',
        hasAllPermission: props.passedStudent.hasAllPermission || false,
        hasPoolPermission: props.passedStudent.hasPoolPermission || false,
        hasPhotoPermission: props.passedStudent.hasPhotoPermission || false,
        hasMedicalPermission: props.passedStudent.hasMedicalPermission || false,
        hasHospitalPermission: props.passedStudent.hasHospitalPermission || false,
        hasExcursionPermission: props.passedStudent.hasExcursionPermission || false,
        hasActivityPermission: props.passedStudent.hasActivityPermission || false,
        hasSupervisionPermission: props.passedStudent.hasSupervisionPermission || false,
      });
    }
  }, [props.passedStudent]);
  

  const handleClickOpen = () => {
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

    if (type === 'checkbox') {
      setStudent(prevStudent => ({
        ...prevStudent,
        [name]: checked
      }));

      if (name === "hasAllPermission") {
        setStudent(prevStudent => ({
          ...prevStudent,
          hasAllPermission: checked,
          hasPoolPermission: checked,
          hasPhotoPermission: checked,
          hasMedicalPermission: checked,
          hasHospitalPermission: checked,
          hasExcursionPermission: checked,
          hasActivityPermission: checked,
          hasSupervisionPermission: checked
        }));
      }
    } else {
      setStudent(prevStudent => ({
        ...prevStudent,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    props.editStudent(student, student.id);
    handleClose();
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <EditIcon color="primary" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Student</DialogTitle>
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

export default EditStudent;
