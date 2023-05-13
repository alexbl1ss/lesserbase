import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';
import EditTransfer from '../AddsEdits/EditTransfer.js';
import AddTransfer from '../AddsEdits/AddTransfer.js';
import Stack from '@mui/material/Stack';

function StudentTransfers(props) {
  const { selectedPerson } = props;
  const [transfers, setTransfers] = useState([]);

  const fetchTransfers = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/transfers/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) { 
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch payments');
        }
      })
      .then((data) => {
        sessionStorage.setItem('payments', JSON.stringify(data));
        setTransfers(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const deleteTransfer = (event, transfer) => {
    event.preventDefault();
  
    const token = sessionStorage.getItem("bearer");
    const id = transfer.id;
  
    fetch(`${SERVER_URL}api/transferid/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        fetchTransfers();
      } else {
        alert("Error deleting Transfer");
        console.error(response.statusText);
      }
    })
    .catch(error => {
      alert("Error deleting Transfer");
      console.error(error);
    });
  }
  
  const editTransfer = (transfer, id) => {
     
    const token = sessionStorage.getItem("bearer"); 
    fetch(`${SERVER_URL}api/transferid/${id}`,
      { method: 'PUT', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(transfer)
    })
    .then(response => {
      if (response.ok) {
        fetchTransfers();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }
  const addTransfer = (transfer, id) => {
     
    const token = sessionStorage.getItem("bearer"); 
    fetch(`${SERVER_URL}api/transfers/${id}`,
      { method: 'POST', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(transfer)
    })
    .then(response => {
      if (response.ok) {
        fetchTransfers();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }
 

  return(
    <React.Fragment>
        <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
              <th>ID</th>
                <th>Direction</th>
                <th>Date</th>
                <th>Leaving</th>
                <th>Arriving</th>
                <th>Self Transfer</th>
                <th>Depart</th>
                <th>Arrive</th>
                <th>Flight</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>{transfer.id}</td>
                  <td>{transfer.direction}</td>
                  <td>{transfer.transferDate}</td>
                  <td>{transfer.depart}</td>
                  <td>{transfer.arrive}</td>
                  <td>{transfer.privatePickup ? "Yes" : "No"}</td>
                  <td>{transfer.departureTime}</td>
                  <td>{transfer.arrivalTime}</td>
                  <td>{transfer.flightId}</td>
                  <td>
                    <EditTransfer passedTransfer={transfer} editTransfer={editTransfer} />
                  </td>
                  <td>
                    <IconButton onClick={(event) => deleteTransfer(event, transfer)}><Delete color="primary"/></IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px'  }}>
          <Stack direction="row" spacing={2}>
            <AddTransfer
                passedStudent={selectedPerson}
                addTransfer={addTransfer}
                direction={'IN'}
            />
            <AddTransfer
                passedStudent={selectedPerson}
                addTransfer={addTransfer}
                direction={'OUT'}
                />
            </Stack>
            </div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default StudentTransfers;
