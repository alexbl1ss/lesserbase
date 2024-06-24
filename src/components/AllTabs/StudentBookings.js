import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CUTOFF_DATE } from '../../constants';
import '../BookingCard.css';

function StudentBookings(props) {
  const { selectedPerson } = props;
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/student/${selectedPerson.id}/booking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch bookings'))
      .then(data => {
        const filteredData = data.filter(booking => 
          !booking.startDate || new Date(booking.startDate) > new Date(CUTOFF_DATE)
        );
        sessionStorage.setItem('bookings', JSON.stringify(filteredData));
        setBookings(filteredData.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
      })
      .catch(err => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <React.Fragment>
      <div className="booking-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {bookings.map((booking) => (
          <div key={booking.bookingId} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '90%' }}>
            <p><strong>{booking.productName}</strong></p>
            {booking.endDate !== booking.startDate ? (
              <React.Fragment>
                <p><strong>Start Date:</strong> {booking.startDate}</p>
                <p><strong>End Date:</strong> {booking.endDate}</p>
              </React.Fragment>
            ) : (
              <p><strong>Date:</strong> {booking.startDate}</p>
            )}
          </div>
        ))}
      </div>
      <div>
        <p style={{ color: '#999', fontSize: '12px' }}>Student ID: {selectedPerson.id}</p>
        <p style={{ color: '#999', fontSize: '12px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated') ? 'Yes' : 'No'}</p>
      </div>
    </React.Fragment>
);


}

export default StudentBookings;
