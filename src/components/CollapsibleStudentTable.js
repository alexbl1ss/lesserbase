import React, { useState, useRef } from 'react';

function CollapsibleStudentTable({ incompleteStudents, onSelectStudent, title }) {
  const [openIndex, setOpenIndex] = useState(null); // State to control individual rows
  const [isTableCollapsed, setIsTableCollapsed] = useState(true); // State to control the entire table

  const tableRef = useRef(null); 
  
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
  const handleSelectClick = (student, e) => {
    e.preventDefault(); // Prevent the default button action
    e.stopPropagation(); // Stop click propagation to lower layers

    // Log student details and call onSelectStudent with the student ID
    //console.log("student Details:", student);
    onSelectStudent(student.id);
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
          {title} ({incompleteStudents.length}) {/* Display the count */}
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
          {incompleteStudents.length > 0 ? (
            incompleteStudents.map((student, index) => (
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
                  Student {student.id} : {student.studentSurname}
                  <button
                    onClick={(e) => handleSelectClick(student, e)}
                    style={{
                      float: 'right',
                      marginRight: '20px',
                      backgroundColor: '#227387',
                      color: 'white',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    aria-label={`Select student ${student.id}`}
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
                    <span><strong>student id:</strong> {student.id}</span>
                    <span><strong>student mtRef:</strong> {student.mtRef}</span>
                    <span><strong>student name:</strong> {student.studentName}</span>
                    <span><strong>student surname:</strong> {student.studentSurname}</span>
                    <span><strong>student gender:</strong> {student.studentGender}</span>
                    <span><strong>student nationality:</strong> {student.studentNationality}</span>
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

export default CollapsibleStudentTable;
