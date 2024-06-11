import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js';
import AddAdult from '../AddsEdits/AddAdult.js';
import EditAdult from '../AddsEdits/EditAdult.js';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';

function Adults(props) {
    const [adults, setAdults] = useState([]);

    const fetchAdults = useCallback(() => {
        console.log('Fetching adults...');
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/adults`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            setAdults(data);
            sessionStorage.setItem('adults', JSON.stringify(data));
        })
        .catch(err => console.error('Failed to fetch adults', err));
    }, []);

    useEffect(() => {
        console.log('Component mounted or updated');
        fetchAdults();
    }, [fetchAdults]);

    const addAdult = adult => {
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/adults`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(adult)
        })
        .then(response => response.ok ? fetchAdults() : alert('Something went wrong!'))
        .catch(err => console.error('Error posting adult', err));
    };

    const editAdult = updatedAdult => {
        console.log(updatedAdult)
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/adults/${updatedAdult.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAdult)
        })
        .then(response => response.ok ? fetchAdults() : alert('Something went wrong!'))
        .catch(err => console.error('Error updating adult', err));
    };

    const deleteAdult = (event, adultId) => {
        event.preventDefault();
      
        const token = sessionStorage.getItem("bearer");
        
        fetch(`${SERVER_URL}api/adults/${adultId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })
          .then(response => response.json())
          .then(data => {
            const adultId = data.id;
            
            return fetch(`${SERVER_URL}api/adult/delete/${adultId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              method: 'DELETE'
            })
          })
          .then(response => {
    
            if (response.ok) {
              fetchAdults();
            }
            else {
              alert('Something went wrong!');
            }
          })
          .catch(err => console.error(err))
      }

    return (
        <React.Fragment>
            <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
                <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Gender</th>
                            <th>Allergies</th>
                            <th>Role</th>
                            <th>Notes</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adults.map(adult => (
                            <tr key={adult.id}>
                                <td>{adult.id}</td>
                                <td>{adult.adultName}</td>
                                <td>{adult.adultSurname}</td>
                                <td>{adult.adultGender}</td>
                                <td>{adult.allergies}</td>
                                <td>{adult.role}</td>
                                <td>{adult.notes}</td>
                                <td>
                                    <EditAdult adultToEdit={adult} updateAdult={editAdult}/>
                                </td>
                                <td>
                                    <IconButton onClick={(event) => deleteAdult(event, adult.id)}><Delete color="primary"/></IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddAdult addAdult={addAdult} />
            <div>
                <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
            </div>
        </React.Fragment>
    );
}

export default Adults;
