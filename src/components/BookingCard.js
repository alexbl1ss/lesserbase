import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js'
import './BookingCard.css';


function BookingCard({ person, onClose }) {
 
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/student/${person.id}/booking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="detail-card booking-card">
      <h2>Bookings</h2>
        <table>
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
  );
}

export default BookingCard;
