import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES } from '../../constants.js'
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function LeaderAllocator(props) {
    const [adults, setAdults] = useState([]);
    const [campGroups, setCampGroups] = useState([]);
    const [selectedLeader, setSelectedLeader] = useState({
        id: '',
        adultName: '',
        adultSurname: '',
        adultGender: '',
        allergies: '',
        notes: '',
        role: ''
    });
    const [selectedGroup, setSelectedGroup] = useState({
        id: '',
        groupName: '',
        leader: '',
        campus: '',
        capacity: '',
        notes: '',
        groupType: '',
        leaderIdOnly: ''
    });

    const fetchleaders = useCallback(() => {
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
          throw new Error('Failed to fetch campgroups');
        }
      })
      .then((data) => {
        sessionStorage.setItem('campgroups', JSON.stringify(data));
        setCampGroups(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchleaders();
    fetchGroups();
  }, []);

  const handleGroupSelect = (group) => {
    // Log the current state before changing it
    console.log("Current selectedGroup:", selectedGroup);
    console.log("Attempting to select/deselect group:", group);

    // Toggle logic based on the current state
    if (selectedGroup && selectedGroup.id === group.id) {
        console.log("Deselecting group");
        setSelectedGroup({});  // Clear selection if the same group is clicked again
    } else {
        console.log("Selecting group");
        setSelectedGroup(group);  // Set the new group
    }
};

  
  const handleAllocate = async () => {
    if (!selectedGroup.id || !selectedLeader.id) {
        alert('Please select a group and a leader before allocating.');
        return;
    }

    const updatedGroup = {
        ...selectedGroup,
        leaderIdOnly: selectedLeader.id
    };

    const url = `${SERVER_URL}api/campgroup/${selectedGroup.id}`;
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('bearer')}`
        },
        body: JSON.stringify(updatedGroup)
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error('Failed to update the group leader');
        }
        const result = await response.json();
        console.log('Group updated successfully:', result);

        // Refresh your groups list here if the UI needs to reflect the change
        fetchGroups();
    } catch (error) {
        console.error('Error updating group leader:', error);
    }
};

  
const handleLeaderChange = (event) => {
    console.log(event)
    const selectedLeader = event.target.value;
    setSelectedLeader(selectedLeader);
};


const handleChange = (event) => {
  console.log(event);
}

  return(
    <React.Fragment>
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0' }}>
        
        <FormControl variant="standard" style={{ minWidth: 240 }}>
            <InputLabel id="campus-label">Campus</InputLabel>
            <Select
                labelId="campus-label"
                id="campus-select"
                name="campus"
                onChange={handleChange}
            >
                {CAMPUSES.map((campus) => (
                    <MenuItem key={campus.id} value={campus.value}>
                        {campus.value}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        
        <FormControl variant="standard" style={{ minWidth: 240 }}>
            <InputLabel id="type-label">Group Type</InputLabel>
            <Select
                labelId="type-label"
                id="type-select"
                name="type"
                onChange={handleChange}
            >
                {GROUPTYPES.map((grouptypes) => (
                    <MenuItem key={grouptypes.id} value={grouptypes.value}>
                        {grouptypes.value}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>

        <FormControl variant="standard" style={{ minWidth: 240 }}>
    <InputLabel id="leader-label">Leader</InputLabel>
    <Select
        labelId="leader-label"
        id="leader-select"
        name="leader"
        value={selectedLeader}
        onChange={handleLeaderChange}
        renderValue={(selected) => selected ? `${selected.adultName} ${selected.adultSurname}` : ''}
    >
        {adults.map((adult) => (
            <MenuItem key={adult.id} value={adult}>
                {adult.adultName + ' ' + adult.adultSurname}
            </MenuItem>
        ))}
    </Select>
</FormControl>

    </div>
    <button onClick={handleAllocate} type="button">Allocate</button>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
      <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Notes</th>
            <th>Leader</th>
            <th>select?</th>
          </tr>
        </thead>
        <tbody>
        {campGroups.map((campgroup) => (
          <tr key={campgroup.id}>
          <td>{campgroup.id}</td>
          <td>{campgroup.groupName}</td>
          <td>{campgroup.groupType}</td>
          <td>{campgroup.notes}</td>
          <td>{campgroup.leader ? `${campgroup.leader.adultName} ${campgroup.leader.adultSurname}` : 'No leader assigned'}</td>
          <td>
          <input
  type="checkbox"
  checked={selectedGroup && selectedGroup.id === campgroup.id}
  onChange={() => handleGroupSelect(campgroup)}
/>
</td>
      </tr>
    ))}
        </tbody>
      </table>
    </div>
    
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default LeaderAllocator;
