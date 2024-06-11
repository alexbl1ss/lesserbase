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


function WhoIsDoing() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);
  
  const [activities, setActivities] = useState([]);
  const [activitiesCount, setActivitiesCount] = useState([]);
  const [residents, setResidents] = useState([]);
  const [residentsCount, setResidentsCount] = useState([]);
  const [residentsTableCollapsed, setResidentsTableCollapsed] = useState(false);
  const [activitiesTableCollapsed, setActivitiesTableCollapsed] = useState(false);
  const [campus, setCampus] = useState('Kilgraston');

// Update formattedDate whenever selectedDate changes
useEffect(() => {
  const newFormattedDate = selectedDate.toISOString().split('T')[0];
  if (newFormattedDate !== formattedDate) {
    setFormattedDate(newFormattedDate);
  }
}, [selectedDate, formattedDate]); // Include formattedDate to avoid unnecessary updates

const fetchActivities = useCallback((formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisdoing/${formattedDate}/${campus}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch activities');
        }
      })
      .then((data) => {
        sessionStorage.setItem('activities', JSON.stringify(data));
        setActivities(data);
      })
      .catch((err) => console.error(err));
  },[campus]);

  const fetchResidents = useCallback((formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisresident/${formattedDate}/${campus}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch Residents');
        }
      })
      .then((data) => {
        sessionStorage.setItem('residents', JSON.stringify(data));
        setResidents(data);
      })
      .catch((err) => console.error(err));
    },[campus]);

  const fetchResidentsCount = useCallback((formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/residentcount/${formattedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch Residents Count');
        }
      })
      .then((data) => {
        sessionStorage.setItem('residentsCount', JSON.stringify(data));
        setResidentsCount(data);
      })
      .catch((err) => console.error(err));
  },[]);

  const fetchActivitiesCount = useCallback((formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/activitiesCount/${formattedDate}/${campus}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch Activities Count');
        }
      })
      .then((data) => {
        sessionStorage.setItem('activitiesCount', JSON.stringify(data));
        setActivitiesCount(data);
      })
      .catch((err) => console.error(err));
  },[campus]);

  // Fetch data whenever formattedDate changes
useEffect(() => {
  fetchActivities(formattedDate);
  fetchResidents(formattedDate);
  fetchResidentsCount(formattedDate);
  fetchActivitiesCount(formattedDate);
}, [formattedDate, fetchActivities, fetchResidents, fetchActivitiesCount, fetchResidentsCount]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
            
  const handleExportCSV = (dataToExport, headerRow, fileName) => {
    
    
    // Convert activities to CSV format
    const csvData = dataToExport.map(
      ({ studentId, bookingId, productId, productName, productBase, studentName, studentSurname }) =>
        `${studentId},${bookingId},${productId},${productName},${productBase},${studentName},${studentSurname}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headerRow + '\n' + csvData.join('\n');

    // Trigger download of CSV file
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  };

  const handleResidentExportCSV = (dataToExport, headerRow, fileName) => {
    console.log("in handle residents export");
  
    // Convert activities to CSV format
    const csvData = dataToExport.map(
      ({ id, type, name, gender, base, arrival, departure, notes }) =>
        `${id},${type},${name},${gender},${base},${arrival},${departure},${notes}`
    );
    const csvContent = headerRow + '\n' + csvData.join('\n');
  
    // Using FileSaver to save the file
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, fileName);
  };

  
  const handleTransferExportCSV = (dataToExport, headerRow, fileName) => {
    // Convert transfers to CSV format
    const csvData = dataToExport.map(
      ({ studentId, mtRef, name, departing, transferId, departureTime, privatePickup, flightId, destination, arrivalTime }) =>
        `${studentId},${mtRef},${name},${departing},${transferId},${departureTime},${privatePickup},${flightId},${destination},${arrivalTime}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headerRow + '\n' + csvData.join('\n');
  
    // Trigger download of CSV file
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  };
 
  const handleCampusChangeKilgraston = () => {
    setCampus('Kilgraston');
  
//    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format the selected date as YYYY-MM-DD
  
    fetchActivities(formattedDate);
    fetchResidents(formattedDate);
    fetchResidentsCount(formattedDate);
    fetchActivitiesCount(formattedDate)

  };
  const handleCampusChangeStrathallan = () => {
    setCampus('Strathallan');
     
    fetchActivities(formattedDate);
    fetchResidents(formattedDate);
    fetchResidentsCount(formattedDate);
    fetchActivitiesCount(formattedDate)

  }

  const handleCampusChangeGlenalmond = () => {
    setCampus('Glenalmond');
  
//    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format the selected date as YYYY-MM-DD
  
    fetchActivities(formattedDate);
    fetchResidents(formattedDate);
    fetchResidentsCount(formattedDate);
    fetchActivitiesCount(formattedDate)

  }


  return (
    <section className="garamond">
      <div className="pa2"></div>
      <button onClick={handleCampusChangeKilgraston}  type="button">Kilgraston</button>
      <button onClick={handleCampusChangeStrathallan}  type="button">Strathallan</button>
      <div style={{ marginBottom: '10px' }}></div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField {...params} variant="standard" helperText="" />
          )}
        />
      </LocalizationProvider>
      <div style={{ marginLeft: '50px' }}>
      <table style={{ width: '30%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '10px' }}>
            <thead>
            <tr>
            <th colSpan="3">All Residents</th>
          </tr>
            <th>Campus</th>
            <th>Resident Type</th>
            <th>count</th>
            </thead>
            <tbody>
            {residentsCount.map((residentcount) => (
            <React.Fragment key={`${residentcount.campus}-${residentcount.residentType}`}>
              <tr>
              <td>{residentcount.campus}</td>
              <td>{residentcount.residentType}</td>
              <td>{residentcount.residentCount}</td>
            </tr>
            </React.Fragment>
          ))}
            </tbody>
          </table>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>Residents Detail (selected campus only)</span>
    <IconButton
      onClick={() => setResidentsTableCollapsed(!residentsTableCollapsed)}
      aria-expanded={residentsTableCollapsed}
      aria-label="show more"
    >
      {residentsTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </div>
  <Collapse in={residentsTableCollapsed}>
    <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Role</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Campus</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((resident) => (
            <React.Fragment key={`${resident.id}-${resident.type}`}>
              <tr>
              <td>{resident.id}</td>
              <td>{resident.type}</td>
              <td>{resident.name}</td>
              <td>{resident.gender}</td>
              <td>{resident.base}</td>
              <td>{resident.arrival}</td>
              <td>{resident.departure}</td>
              <td>{resident.notes}</td>
            </tr>
            </React.Fragment>
          ))}
        </tbody>
        </table>
        <button onClick={() => handleResidentExportCSV(residents,
            "Id, Role, Name, gender, Campus, Arrival, Departure, Notes",
            "residents.csv")} type="button">
  Save Residents CSV
</button>
</Collapse>
</div>

<div style={{ marginLeft: '50px' }}>
<table style={{ width: '30%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '10px', marginTop: '10px'}}>
  <thead>
    <tr>
      <th colSpan="4">{campus} Activities</th>
    </tr>
    <tr>
      <th>ID</th>
      <th>Activity</th>
      <th>Base</th>
      <th>Count</th>
    </tr>
  </thead>
  <tbody>
    {activitiesCount.map((activityCount) => (
      <React.Fragment key={`${activityCount.product_id}`}>
        <tr>
          <td>{activityCount.product_id}</td>
          <td>{activityCount.product_name}</td>
          <td>{activityCount.product_base}</td>
          <td>{activityCount.count}</td>
        </tr>
      </React.Fragment>
    ))}
  </tbody>
</table>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <p>Activities Detail</p>
              <IconButton
      onClick={() => setActivitiesTableCollapsed(!activitiesTableCollapsed)}
      aria-expanded={activitiesTableCollapsed}
      aria-label="show more"
    >
      {activitiesTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </div>
  <Collapse in={activitiesTableCollapsed}>
    <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Student Id</th>
            <th>Booking Id</th>
            <th>Product Id</th>
            <th>Product Name</th>
            <th>Product Base</th>
            <th>Student Name</th>
            <th>Student Surname</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.studentId}>
              <td>{activity.studentId}</td>
              <td>{activity.bookingId}</td>
              <td>{activity.productId}</td>
              <td>{activity.productName}</td>
              <td>{activity.productBase}</td>
              <td>{activity.studentName}</td>
              <td>{activity.studentSurname}</td>
            </tr>
          ))}
        </tbody>
        </table>
        <button onClick={() => handleExportCSV(activities,
            "Child Id, Booking Id, Product Id, Product Name, Product Base, Student Name, Student Surname",
            "activities.csv")} type="button">
  Save Activities CSV
</button>
</Collapse>
</div>

      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>
          Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
        </p>
      </div>
    </section>
  );
}

export default WhoIsDoing;
