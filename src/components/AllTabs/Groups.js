import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import AddGroup from '../AddsEdits/AddStay.js';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit Icon
import EditStay from '../AddsEdits/EditStay.js';
import IconButton from '@mui/material/IconButton'; // Import IconButton from Material-UI

function Groups(props) {
    const { selectedPerson, selectedStay } = props;
    const [groups, setGroups] = useState([]);
    const [editOpen, setEditOpen] = useState(false);

    const fetchGroups = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/campgroups`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (response.status === 204) {
                    return [];
                } else if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch groups');
                }
            })
            .then((data) => {
                sessionStorage.setItem('groups', JSON.stringify(data));
                setGroups(data);
            })
            .catch((err) => console.error(err));
    }, []);

    const addGroup = (group) => {
        const token = sessionStorage.getItem("bearer");

        fetch(`${SERVER_URL}api/campgroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(group)
        })
            .then(response => {
                if (response.ok) {
                    fetchGroups();
                } else {
                    alert('Something went wrong!');
                }
            })
            .catch(err => console.error(err))
    }

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return (
        <React.Fragment>
            <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
                <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Campus</th>
                            <th>Capacity</th>
                            <th>Notes</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => (
                            <tr key={group.id}>
                                <td>{group.id}</td>
                                <td>{group.groupName}</td>
                                <td>{group.campus}</td>
                                <td>{group.capacity}</td>
                                <td>{group.notes}</td>
                                <td>{group.groupType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddGroup
                addGroup={AddGroup}
            />
            <div>
                <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
            </div>
        </React.Fragment>
    );
}

export default Groups;
