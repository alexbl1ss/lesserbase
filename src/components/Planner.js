import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SERVER_URL } from '../constants.js';
import './WhoIsDoing.css';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { saveAs } from 'file-saver';
import PlanningTabs from './TabComponent/PlanningTabs.js';



function Planner() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);

  useEffect(() => {
    const newFormattedDate = selectedDate.toISOString().split('T')[0];
    setFormattedDate(newFormattedDate);
  }, [selectedDate]);
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const showTabs = () => {
    
    return <PlanningTabs/>;
    
  };
   
  return (
    <section className="garamond">
      <div className="pa2"></div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField {...params} variant="standard" helperText="" />
          )}
        />
        {showTabs()}
      </LocalizationProvider>
      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>
          Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
        </p>
      </div>
    </section>
  );
}

export default Planner;
