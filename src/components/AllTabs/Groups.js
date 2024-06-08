import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import AddGroup from '../AddsEdits/AddGroup.js';
import EditGroup from '../AddsEdits/EditGroup.js';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';

function Groups() {
    const [groups, setGroups] = useState([]);
    
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

    const updateGroup = updatedGroup => {
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/campgroup/${updatedGroup.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedGroup)
        })
        .then(response => response.ok ? fetchGroups() : alert('Something went wrong!'))
        .catch(err => console.error('Error updating group', err));
    };

    const deleteGroup = (event, groupId) => {
        event.preventDefault();
      
        const token = sessionStorage.getItem("bearer");
        
        fetch(`${SERVER_URL}api/campgroups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })
          .then(response => response.json())
          .then(data => {
            const groupId = data.id;
            
            return fetch(`${SERVER_URL}api/campgroup/delete/${groupId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              method: 'DELETE'
            })
          })
          .then(response => {
    
            if (response.ok) {
              fetchGroups();
            }
            else {
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
                                <td>
                                    <EditGroup groupToEdit={group} updateGroup={updateGroup}/>
                                </td>
                                <td>
                                    <IconButton onClick={(event) => deleteGroup(event, group.id)}><Delete color="primary"/></IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddGroup
                addGroup={addGroup}
            />
            <div>
                <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
            </div>
        </React.Fragment>
    );
}

export default Groups;
