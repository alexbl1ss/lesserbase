import React, { useState } from 'react';

function CollapsibleTable({ incompleteBookings, onSelectStudent }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleRow = (index) => {
    const booking = incompleteBookings[index];
    onSelectStudent(booking.studentId); // Call the onSelectStudent function with the student ID
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="Tabs" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <h2 style={{ color: '#227387', marginBottom: '15px' }}>Incomplete Bookings</h2>
      <div className="collapsible-table" style={{ width: '80%', margin: '0 auto' }}>
        {incompleteBookings.length > 0 ? (
          incompleteBookings.map((booking, index) => (
            <div key={index}>
              <div
                className={`nav ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleRow(index)}
                style={{ cursor: 'pointer', padding: '10px', borderRadius: '10px', margin: '5px 0', backgroundColor: '#39A2DB', color: 'white', textAlign: 'left' }}
              >
                Student {booking.studentId} at {booking.campus}
              </div>
              {openIndex === index && (
                <div className="content" style={{ padding: '10px', backgroundColor: '#dbe2e3', color: '#227387', textAlign: 'left' }}>
                    : <strong>Stay Start:</strong> {booking.stayStart}
                    : <strong>Stay End:</strong> {booking.stayEnd}
                    : <strong>Stay Duration:</strong> {booking.stayDuration} days
                    : <strong>Booking Coverage:</strong> {booking.bookingCoverage} days
                     : <strong>Missing Days:</strong> {booking.stayDuration - booking.bookingCoverage}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No incomplete bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default CollapsibleTable;
