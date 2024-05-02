import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'

function StudentStays(props) {

    const { selectedPerson } = props;
    const [stays, setStays] = useState([]);
    const [selectedStay, setSelectedStay] =useState(null);


    const fetchStays = useCallback(() => {
      const token = sessionStorage.getItem('bearer');
      fetch(`${SERVER_URL}api/student/${selectedPerson.id}/stays`, {
          headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.status === 204) { 
            return [];
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to fetch stays');
          }
        })
        .then((data) => {
          sessionStorage.setItem('stays', JSON.stringify(data)); // Corrected the key here
          setStays(data);
          if (data.length > 0) {
            setSelectedStay(data[data.length - 1]);  // Set to the most recent stay
          }
        })
        .catch((err) => console.error(err));
    }, [selectedPerson.id]);
      
      useEffect(() => {
        fetchStays();
      }, [fetchStays]);
    
      const handleStaySelect = useCallback((stay) => {
        if(selectedStay === stay) {
        console.log("don't actually do anything - ignore the deselection")
        } else {
        console.log(stay);
        setSelectedStay(stay);
        }
    }, [selectedStay]);
    
      return(
        <React.Fragment>
            <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
            <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                  <th>ID</th>
                    <th>Campus</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                  </tr>
                </thead>
                <tbody>
                  {stays.map((stay) => (
                    <tr key={stay.stayId}>
                      <td>{stay.stayId}</td>
                      <td>{stay.campus}</td>
                      <td>{stay.arrivalDate}</td>
                      <td>{stay.departureDate}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStay && stay.stayId === selectedStay.stayId}
                          onChange={() => handleStaySelect(stay)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
            <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
          </div>
        </React.Fragment>
    );
        
}

export default StudentStays;