import React, { useState, useEffect } from 'react';
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
import EditTransfer from './AddsEdits/EditTransfer.js';
import AddTransfer from './AddsEdits/AddTransfer.js';
import { CAMPUSES } from '../constants';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';


function Transfers() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [arrivers, setArrivers] = useState([]);
  const [leavers, setLeavers] = useState([]);
  const [transfersInTableCollapsed, setTransfersInTableCollapsed] = useState(false);
  const [transfersOutTableCollapsed, setTransfersOutTableCollapsed] = useState(false);
  const [campus, setCampus] = useState('Kilgraston');

  // Update formattedDate whenever selectedDate changes
  useEffect(() => {
    const newFormattedDate = selectedDate.toISOString().split('T')[0];
    setFormattedDate(newFormattedDate);
  }, [selectedDate]);

  useEffect(() => {
    console.log("selectedDate set in Transfers:", selectedDate);
  }, [selectedDate]);
  
  // Fetch data whenever formattedDate changes
  useEffect(() => {
    fetchArrivers(formattedDate);
    fetchLeavers(formattedDate);
  }, [formattedDate]);

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

  const editTransfer = (transfer, id) => {
    const { student, ...updatedTransfer } = transfer; // Destructure the `student` field from `transfer`
  
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/transferid/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTransfer), // Use the updatedTransfer object in the request body
    })
      .then((response) => {
        if (response.ok) {
          fetchArrivers(formattedDate);
        } else {
          alert('Something went wrong!');
        }
      })
      .catch((err) => console.error(err));
  };
  
  const addTransfer = (transfer, id) => {
     
    const token = sessionStorage.getItem("bearer"); 
    fetch(`${SERVER_URL}api/transfers/${id}`,
      { method: 'POST', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(transfer)
    })
    .then(response => {
      if (response.ok) {
        fetchArrivers(formattedDate);
        fetchLeavers(formattedDate);
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }
  

  const sortedArrivers = arrivers.sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
    const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
    return timeA - timeB;
  });
  
  return (
    <section className="garamond">
      <div className="pa2"></div>
      <div style={{ marginBottom: '10px' }}></div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
        />
      </LocalizationProvider>
      <FormControl variant="standard" style={{ minWidth: 120 }}>
        <InputLabel id="campus-select-label">Campus</InputLabel>
        <Select
          labelId="campus-select-label"
          id="campus-select"
          value={campus}
          onChange={(e) => setCampus(e.target.value)}
          >
          {CAMPUSES.map((campusOption) => (
          <MenuItem key={campusOption.value} value={campusOption.value}>
          {campusOption.label}
          </MenuItem>
          ))}
        </Select>
      </FormControl>
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
          <table
            style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr>
                <th>Student Id</th>
                <th>Name</th>
                <th>transferId</th>
                <th>Campus</th>
                <th>Airport</th>
                <th>Flight</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedArrivers.map((arriver) => (
                <tr key={arriver.studentId}>
                  <td>{arriver.studentId}</td>
                  <td>{arriver.name}</td>
                  <td>{arriver.transferId}</td>
                  <td>{arriver.destination}</td>
                  <td>{arriver.departing}</td>
                  <td>{arriver.flightId}</td>
                  <td>{arriver.arrivalTime}</td>
                  <td>{arriver.transferId === 0 || arriver.transferId === null ? 'UNKNOWN' : 'SCHEDULED'}</td>
                  {arriver.transferId === 0 || arriver.transferId === null ? (
                    <AddTransfer
                    transferDate={selectedDate.toDate()} // Converts Dayjs object to Date
                    direction="IN"
                    passedStudent={arriver}
                    addTransfer={addTransfer}
                  />
                  ) : (
                    <EditTransfer
                      person_id={arriver.studentId}
                      transfer_id={arriver.transferId}
                      editTransfer={editTransfer}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              handleTransferExportCSV(
                arrivers,
                'Student Id, Master Tracker Ref, Name, Departing, Transfer Id, Departure Time, Self Transfer, Flight, Destination, Arrival Time',
                'TransfersIn.csv'
              )
            }
            type="button"
          >
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
          <table
            style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}
          >
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
                <tr key={leaver.id}>
                  <td>{leaver.id}</td>
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
          <button
            onClick={() =>
              handleTransferExportCSV(
                leavers,
                'Student Id, Master Tracker Ref, Name, Departing, Transfer Id, Departure Time, Self Transfer, Flight, Destination, Arrival Time',
                'TransfersOut.csv'
              )
            }
            type="button"
          >
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

export default Transfers;
