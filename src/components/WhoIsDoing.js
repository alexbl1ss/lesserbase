import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SERVER_URL } from '../constants.js';
import './InvoicePage.css';

function WhoIsDoing() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activities, setActivities] = useState([]);

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  
    const formattedDate = date.format('YYYY-MM-DD');
    console.log(formattedDate);
    fetchActivities(formattedDate);
  };
      
  const handleExportCSV = () => {
    
    const csvHeaderRow = "Student Id, Booking Id, Product Id, Product Name, Product Base, Student Name, Student Surname";
    // Convert activities to CSV format
    const csvData = activities.map(
      ({ studentId, bookingId, productId, productName, productBase, studentName, studentSurname }) =>
        `${studentId},${bookingId},${productId},${productName},${productBase},${studentName},${studentSurname}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + csvHeaderRow + '\n' + csvData.join('\n');

    // Trigger download of CSV file
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', 'activities.csv');
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
      <button onClick={handleExportCSV} type="button">Save CSV</button>
      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>
          Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
        </p>
      </div>
    </section>
  );
}

export default WhoIsDoing;
