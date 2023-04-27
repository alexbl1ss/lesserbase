import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../BookingCard.css';

function StudentBookings(props) {
  const { selectedPerson } = props;
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/student/${selectedPerson.id}/booking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('bookings', JSON.stringify(data));
        setBookings(data);})
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


 
  return(
    <React.Fragment>
    <div className="detail-card booking-card">
    <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Default Rate</th>
            <th>Actual Charge</th>
            <th>Booking Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.bookingId}>
              <td>{booking.bookingId}</td>
              <td>{booking.productName}</td>
              <td>{booking.startDate}</td>
              <td>{booking.endDate}</td>
              <td>{booking.defaultRate}</td>
              <td>{booking.actualCharge}</td>
              <td>{booking.bookingStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <div>
        <p>Student: {selectedPerson.id}</p>
        <p>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default StudentBookings;
