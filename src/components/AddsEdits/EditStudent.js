import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField, Grid, Typography, FormControlLabel, Checkbox, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
    emergencyContact: '',
  mobilePhoneOptOut: false,
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
        emergencyContact: props.passedStudent.emergencyContact || '',
mobilePhoneOptOut: props.passedStudent.mobilePhoneOptOut || false,
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Name"
            value={student.studentName || ''}
            onChange={handleChange}
            fullWidth
            name="studentName"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Surname"
            value={student.studentSurname || ''}
            onChange={handleChange}
            fullWidth
            name="studentSurname"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <TextField
            label="Gender"
            value={student.studentGender || ''}
            onChange={handleChange}
            fullWidth
            name="studentGender"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Nationality"
            value={student.studentNationality || ''}
            onChange={handleChange}
            fullWidth
            name="studentNationality"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="English Level"
            value={student.englishLevel || ''}
            onChange={handleChange}
            fullWidth
            name="englishLevel"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Room Requirements"
            value={student.roomRequirements || ''}
            onChange={handleChange}
            fullWidth
            name="roomRequirements"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Class Requirements"
            value={student.classRequirements || ''}
            onChange={handleChange}
            fullWidth
            name="classRequirements"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Allergies"
            value={student.allergies || ''}
            onChange={handleChange}
            fullWidth
            name="allergies"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
            label="Notes"
            value={student.notes || ''}
            onChange={handleChange}
            fullWidth
            name="notes"
            sx={{ mb: 0, mt: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
  <TextField
    label="Emergency Contact"
    value={student.emergencyContact || ''}
    onChange={handleChange}
    fullWidth
    name="emergencyContact"
    sx={{ mb: 0, mt: 0 }}
  />
</Grid>

<Grid item xs={12} sm={6}>
  <FormControlLabel
    control={
      <Checkbox
        checked={student.mobilePhoneOptOut}
        onChange={handleChange}
        name="mobilePhoneOptOut"
      />
    }
    label="Mobile Phone Opt-Out"
  />
</Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: '100%', borderTop: '1px solid #e0e0e0', my: 2 }} />
          </Grid>
          <Accordion sx={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Permissions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {[
                      { label: "All", name: "hasAllPermission" },
                      { label: "Swimming Pool", name: "hasPoolPermission" },
                      { label: "Photography", name: "hasPhotoPermission" },
                      { label: "Medical", name: "hasMedicalPermission" },
                      { label: "Hospital", name: "hasHospitalPermission" },
                      { label: "Excursions", name: "hasExcursionPermission" },
                      { label: "Activity", name: "hasActivityPermission" },
                      { label: "Supervision", name: "hasSupervisionPermission" },
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <FormControlLabel
                          control={<Checkbox checked={student[item.name]} onChange={handleChange} name={item.name} />}
                          label={item.label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
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
