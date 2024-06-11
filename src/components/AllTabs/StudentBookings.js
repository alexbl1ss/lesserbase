import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CUTOFF_DATE } from '../../constants.js'
import '../BookingCard.css';
import EditBooking from '../AddsEdits/EditBooking.js';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';

function StudentBookings(props) {
  const { selectedPerson, showFinancials } = props;
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/student/${selectedPerson.id}/booking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch bookings');
        }
      })
      .then((data) => {
        const filteredData = data.filter(booking => 
          new Date(booking.startDate) > new Date(CUTOFF_DATE)
        );
        sessionStorage.setItem('bookings', JSON.stringify(filteredData));
        setBookings(filteredData);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

    const sortedBookings = bookings.sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });
  
  const editBooking = (booking, id) => {
    
    const customBooking = {
      ...booking,
      customStart: booking.startDate,
      customEnd: booking.endDate
    }

    const token = sessionStorage.getItem("bearer"); 
    fetch(`${SERVER_URL}api/bookings/${id}`,
      { method: 'PUT', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(customBooking)
    })
    .then(response => {
      if (response.ok) {
        fetchBookings();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }
 
  const deleteBooking = (event, booking) => {
    event.preventDefault();
  
    const token = sessionStorage.getItem("bearer");
    
    fetch(`${SERVER_URL}api/bookings/${booking}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        const productId = data.product.id;
        
        return fetch(`${SERVER_URL}api/bookings/${booking}/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'DELETE'
        })
      })
      .then(response => {

        if (response.ok) {
          fetchBookings();
        }
        else {
          alert('Something went wrong!');
        }
      })
      .catch(err => console.error(err))
  }
      
  return(
    <React.Fragment>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
    <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            {showFinancials && <th>Default Rate</th>}
            {showFinancials && <th>Actual Charge</th>}
            <th>Booking Status</th>
            <th>Booking Notes</th>
          </tr>
        </thead>
        <tbody>
          {sortedBookings.map((booking) => (
            <tr key={booking.bookingId}>
              <td>{booking.bookingId}</td>
              <td>{booking.productName}</td>
              <td>{booking.startDate}</td>
              <td>{booking.endDate}</td>
              {showFinancials && <td>{booking.defaultRate}</td>}
              {showFinancials && <td>{booking.actualCharge}</td>}
              <td>{booking.bookingStatus}</td>
              <td>{booking.notes}</td>
              <td>
                <EditBooking passedBooking={booking} editBooking={editBooking}  showFinancials={props.showFinancials}/>
              </td>
              <td>
              <IconButton onClick={(event) => deleteBooking(event, booking.bookingId)}><Delete color="primary"/></IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default StudentBookings;
