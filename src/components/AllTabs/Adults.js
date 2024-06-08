import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import AddAdult from '../AddsEdits/AddStay.js';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit Icon
import EditStay from '../AddsEdits/EditStay.js';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI

function Adults(props) {
    const { selectedPerson, selectedStay } = props;
    const [adults, setAdults] = useState([]);
    const [editOpen, setEditOpen] = useState(false);

    const fetchAdults = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/adults`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (response.status === 204) {
                    return [];
                } else if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch adults');
                }
            })
            .then((data) => {
                sessionStorage.setItem('adults', JSON.stringify(data));
                setAdults(data);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        fetchAdults();
    }, [fetchAdults]);

    const addAdult = (adult) => {
        const token = sessionStorage.getItem("bearer");

        fetch(`${SERVER_URL}api/adults`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(adult)
        })
            .then(response => {
                if (response.ok) {
                    fetchAdults();
                } else {
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
                        </tr>
                    </thead>
                    <tbody>
                        {adults.map((adult) => (
                            <tr key={adult.id}>
                                <td>{adult.id}</td>
                                <td>{adult.adultName}</td>
                                <td>{adult.adultSurname}</td>
                                <td>{adult.adultGender}</td>
                                <td>{adult.allergies}</td>
                                <td>{adult.role}</td>
                                <td>{adult.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddAdult
                addAdult={addAdult}
            />
            <div>
                <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
            </div>
        </React.Fragment>
    );
}

export default Adults;
