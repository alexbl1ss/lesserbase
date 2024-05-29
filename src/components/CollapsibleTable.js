import React, { useState, useRef } from 'react';

function CollapsibleTable({ incompleteBookings, onSelectStudent, title }) {
  const [openIndex, setOpenIndex] = useState(null); // State to control individual rows
  const [isTableCollapsed, setIsTableCollapsed] = useState(true); // State to control the entire table

  const tableRef = useRef(null); // Ref for the table to measure its full height
  
  // Toggle individual row details
  const toggleRow = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Toggle the entire table's visibility
  const toggleTable = (e) => {
    e.preventDefault(); // Prevent the default button action
    e.stopPropagation(); // Stop click propagation to lower layers

    setIsTableCollapsed(!isTableCollapsed);
  };

  // Handle 'Select' button click for details
  const handleSelectClick = (booking, e) => {
    e.preventDefault(); // Prevent the default button action
    e.stopPropagation(); // Stop click propagation to lower layers

    // Log booking details and call onSelectStudent with the student ID
    //console.log("Booking Details:", booking);
    onSelectStudent(booking.studentId);
  };

  return (
    <div 
      className="CollapsibleTable" 
      ref={tableRef}
      style={{
        marginTop: '20px',
        marginBottom: '20px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        borderRadius: '10px',
        backgroundColor: isTableCollapsed ? 'transparent' : '#dbe2e3',
        border: '1px solid #39A2DB',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#39A2DB',
          color: 'white',
          padding: '10px',
          borderRadius: '10px 10px 0 0',
        }}
        onClick={toggleTable}
      >
        <h2 style={{ margin: '0 10px' }}>
          {title} ({incompleteBookings.length}) {/* Display the count */}
        </h2>
        <button
          style={{
            backgroundColor: '#227387',
            color: 'white',
            borderRadius: '5px',
            padding: '5px 10px',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={toggleTable}
          aria-label={isTableCollapsed ? "Expand Table" : "Collapse Table"}
        >
          {isTableCollapsed ? '+' : '−'}
        </button>
      </div>
      {!isTableCollapsed && (
        <div
          className="collapsible-table-content"
          style={{
            width: '100%',
            margin: '0 auto',
            backgroundColor: '#dbe2e3',
            borderRadius: '0 0 10px 10px',
            padding: '10px',
          }}
        >
          {incompleteBookings.length > 0 ? (
            incompleteBookings.map((booking, index) => (
              <div key={index}>
                <div
                  className={`nav ${openIndex === index ? 'active' : ''}`}
                  onClick={() => toggleRow(index)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    margin: '5px 0',
                    backgroundColor: '#39A2DB',
                    color: 'white',
                    textAlign: 'left',
                    borderRadius: '5px',
                  }}
                >
                  Student {booking.studentId} at {booking.campus}
                  <button
                    onClick={(e) => handleSelectClick(booking, e)}
                    style={{
                      float: 'right',
                      marginRight: '20px',
                      backgroundColor: '#227387',
                      color: 'white',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    aria-label={`Select student ${booking.studentId}`}
                  >
                    Select
                  </button>
                </div>
                {openIndex === index && (
                  <div
                    className="content"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px',
                      backgroundColor: '#dbe2e3',
                      color: '#227387',
                      textAlign: 'left',
                      borderRadius: '5px',
                    }}
                  >
                    <span><strong>Stay Start:</strong> {booking.stayStart}</span>
                    <span><strong>Stay End:</strong> {booking.stayEnd}</span>
                    <span><strong>Stay Duration:</strong> {booking.stayDuration} days</span>
                    <span><strong>Booking Coverage:</strong> {booking.bookingCoverage} days</span>
                    <span><strong>Missing Days:</strong> {booking.stayDuration - booking.bookingCoverage}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px', textAlign: 'center' }}>No data found.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CollapsibleTable;
