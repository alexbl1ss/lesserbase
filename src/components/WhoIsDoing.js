import React, { useState } from 'react';
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


function WhoIsDoing() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activities, setActivities] = useState([]);
  const [residents, setResidents] = useState([]);
  const [arrivers, setArrivers] = useState([]);
  const [leavers, setLeavers] = useState([]);
  const [residentsTableCollapsed, setResidentsTableCollapsed] = useState(false);
  const [activitiesTableCollapsed, setActivitiesTableCollapsed] = useState(false);
  const [transfersInTableCollapsed, setTransfersInTableCollapsed] = useState(false);
  const [transfersOutTableCollapsed, setTransfersOutTableCollapsed] = useState(false);

  const fetchActivities = (formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisdoing/${formattedDate}`, {
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
        sessionStorage.setItem('students', JSON.stringify(data));
        setActivities(data);
      })
      .catch((err) => console.error(err));
  };

  const fetchResidents = (formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisresident/${formattedDate}`, {
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
        sessionStorage.setItem('students', JSON.stringify(data));
        setResidents(data);
      })
      .catch((err) => console.error(err));
  };

  const fetchArrivers = (formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisarriving/${formattedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch Arrivers');
        }
      })
      .then((data) => {
        sessionStorage.setItem('students', JSON.stringify(data));
        setArrivers(data);
      })
      .catch((err) => console.error(err));
  };

  const fetchLeavers = (formattedDate) => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whoisleaving/${formattedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch Leavers');
        }
      })
      .then((data) => {
        sessionStorage.setItem('students', JSON.stringify(data));
        setLeavers(data);
      })
      .catch((err) => console.error(err));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  
    const formattedDate = date.format('YYYY-MM-DD');
    console.log(formattedDate);
    fetchActivities(formattedDate);
    fetchResidents(formattedDate);
    fetchArrivers(formattedDate);
    fetchLeavers(formattedDate);
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
    
    
    // Convert activities to CSV format
    const csvData = dataToExport.map(
      ({ id, type, name, gender, base, arrival, departure, notes }) =>
        `${id},${type},${name},${gender},${base},${arrival},${departure},${notes}`
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
      </LocalizationProvider>
      <div style={{ marginLeft: '50px' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>Residents</span>
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
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>Activities</span>
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

<div style={{ marginLeft: '50px' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>Transfers In</span>
    <IconButton
      onClick={() => setTransfersInTableCollapsed(!transfersInTableCollapsed)}
      aria-expanded={transfersInTableCollapsed}
      aria-label="show more"
    >
      {transfersInTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </div>
  <Collapse in={transfersInTableCollapsed}>
    <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Student Id</th>
            <th>Master Tracker Ref</th>
            <th>Name</th>
            <th>Departing</th>
            <th>Transfer Id</th>
            <th>Pickup Time</th>
            <th>Self Transfer</th>
            <th>Flight</th>
            <th>Destination</th>
            <th>Arrival Time</th>
          </tr>
        </thead>
        <tbody>
          {arrivers.map((arriver) => (
            <tr key={arriver.studentId}>
              <td>{arriver.studentId}</td>
              <td>{arriver.mtRef}</td>
              <td>{arriver.name}</td>
              <td>{arriver.departing}</td>
              <td>{arriver.transferId}</td>
              <td>{arriver.departureTime}</td>
              <td>{arriver.privatePickup}</td>
              <td>{arriver.flightId}</td>
              <td>{arriver.destination}</td>
              <td>{arriver.arrivalTime}</td>
            </tr>
          ))}
        </tbody>
        </table>
        <button onClick={() => handleTransferExportCSV(arrivers,
            "Student Id, Master Tracker Ref, Name, Departing, Transfer Id, Departure Time, Self Transfer, Flight, Destination, Arrival Time",
            "TransfersIn.csv")} type="button">
  Save Transfers In CSV
</button>
</Collapse>
</div>

<div style={{ marginLeft: '50px' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span>Transfers Out</span>
    <IconButton
      onClick={() => setTransfersOutTableCollapsed(!transfersOutTableCollapsed)}
      aria-expanded={transfersOutTableCollapsed}
      aria-label="show more"
    >
      {transfersOutTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </div>
  <Collapse in={transfersOutTableCollapsed}>
  <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Student Id</th>
            <th>Master Tracker Ref</th>
            <th>Name</th>
            <th>Departing</th>
            <th>Transfer Id</th>
            <th>Departure Time</th>
            <th>Self Transfer</th>
            <th>Flight</th>
            <th>Destination</th>
            <th>Arrival Time</th>
          </tr>
        </thead>
        <tbody>
          {leavers.map((leaver) => (
            <tr key={leaver.studentId}>
              <td>{leaver.studentId}</td>
              <td>{leaver.mtRef}</td>
              <td>{leaver.name}</td>
              <td>{leaver.departing}</td>
              <td>{leaver.transferId}</td>
              <td>{leaver.departureTime}</td>
              <td>{leaver.privatePickup}</td>
              <td>{leaver.flightId}</td>
              <td>{leaver.destination}</td>
              <td>{leaver.arrivalTime}</td>
            </tr>
          ))}
        </tbody>
        </table>
        <button onClick={() => handleTransferExportCSV(leavers,
            "Student Id, Master Tracker Ref, Name, Departing, Transfer Id, Departure Time, Self Transfer, Flight, Destination, Arrival Time",
            "TransfersOut.csv")} type="button">
  Save Transfers Out CSV
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
