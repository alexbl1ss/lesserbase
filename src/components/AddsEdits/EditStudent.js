import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import { Grid, FormControlLabel, Checkbox, Typography, Box } from '@mui/material';

function EditStudent(props) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState({
    id: '',
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

  useEffect(() => {
    if (props.passedStudent) {
      setStudent({
        id: props.passedStudent.id,
        dateAdded: props.passedStudent.dateAdded || '',
        mtRef: props.passedStudent.mtRef || '',
        studentName: props.passedStudent.studentName || '',
        studentSurname: props.passedStudent.studentSurname || '',
        studentDob: props.passedStudent.studentDob || '',
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
                value={student.mtRef}
                onChange={handleChange}
                fullWidth={true}
                name="mtRef"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Name'
                value={student.studentName}
                onChange={handleChange}
                fullWidth={true}
                name="studentName"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Surname'
                value={student.studentSurname}
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
                value={student.studentGender}
                onChange={handleChange}
                fullWidth={true}
                name="studentGender"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Nationality'
                value={student.studentNationality}
                onChange={handleChange}
                fullWidth={true}
                name="studentNationality"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='English Level'
                value={student.englishLevel}
                onChange={handleChange}
                fullWidth={true}
                name="englishLevel"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Room Requirements'
                value={student.roomRequirements}
                onChange={handleChange}
                fullWidth={true}
                name="roomRequirements"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Class Requirements'
                value={student.classRequirements}
                onChange={handleChange}
                fullWidth={true}
                name="classRequirements"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Allergies'
                value={student.allergies}
                onChange={handleChange}
                fullWidth={true}
                name="allergies"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ mb: 0, mt: 3 }}
                label='Notes'
                value={student.notes}
                onChange={handleChange}
                fullWidth={true}
                name="notes"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ width: '100%', borderTop: '1px solid #e0e0e0', my: 2 }}></Box>
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

export default EditStudent;
