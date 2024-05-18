import React, { useState } from 'react';

function CollapsibleTable({ incompleteBookings, onSelectStudent }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleDetails = (index, event) => {
    event.stopPropagation();  // Stop event propagation to prevent unintended clicks

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
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '10px', margin: '5px 0', backgroundColor: '#39A2DB', color: 'white' }}
              >
                <div
                  onClick={() => toggleDetails(index)}
                  style={{ flex: 1, cursor: 'pointer', textAlign: 'left' }}
                >
                  Student {booking.studentId} at {booking.campus}
                </div>
                <button
                  onClick={() => onSelectStudent(booking.studentId)}
                  style={{ cursor: 'pointer', backgroundColor: '#f0f0f0', color: '#227387', border: 'none', padding: '8px 16px', borderRadius: '5px' }}
                >
                  Select
                </button>
              </div>
              {openIndex === index && (
                <div className="content" style={{ padding: '10px', backgroundColor: '#dbe2e3', color: '#227387', textAlign: 'left' }}>
                  <p><strong>Stay Start:</strong> {booking.stayStart}</p>
                  <p><strong>Stay End:</strong> {booking.stayEnd}</p>
                  <p><strong>Stay Duration:</strong> {booking.stayDuration} days</p>
                  <p><strong>Booking Coverage:</strong> {booking.bookingCoverage} days</p>
                  <p><strong>Missing Days:</strong> {booking.stayDuration - booking.bookingCoverage}</p>
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
