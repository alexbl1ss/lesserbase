import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES } from '../../constants.js';
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function LeaderAllocator(props) {
  const [allAdults, setAllAdults] = useState([]);
  const [filteredAdults, setFilteredAdults] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('');


    const fetchleaders = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/adults`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
          setAllAdults(data);
          setFilteredAdults(data);
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
        setAllGroups(data);
        applyFilters(data, selectedCampus, selectedGroupType);
      })
      .catch((err) => console.error(err));
  }, [selectedCampus, selectedGroupType]);

  useEffect(() => {
    fetchleaders();
    fetchGroups();
  }, [selectedCampus, selectedGroupType]);

  const handleGroupSelect = (group) => {
    if (selectedGroup && selectedGroup.id === group.id) {
        setSelectedGroup(null); 
    } else {
        setSelectedGroup(group);
    }
  };

  const applyFilters = (groups, campus, groupType) => {
    const filtered = groups.filter(group => {
        return (!campus || group.campus === campus) && (!groupType || group.groupType === groupType);
    });
    setFilteredGroups(filtered);
  };
  
const filterAdults = (campus, groupType) => {
  //Placeholder for future adult filtering by campus and role
  
  //const filtered = allAdults.filter(group => {
  //    return (!campus || campus.campus === campus) && (!groupType || group.groupType === groupType);
  //});
  //setFilteredAdults(filtered);
};

const handleCampusChange = (event) => {
  const campus = event.target.value;
  setSelectedCampus(campus);
  applyFilters(allGroups, campus, selectedGroupType);
};

const handleGroupTypeChange = (event) => {
  const groupType = event.target.value;
  setSelectedGroupType(groupType);
  applyFilters(allGroups, selectedCampus, groupType);
};
  
  const handleAllocate = async () => {
    console.log(filteredGroups);
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

        fetchGroups();
    } catch (error) {
        console.error('Error updating group leader:', error);
    }
    console.log(filteredGroups);
  };

const handleDeallocate = async () => {
  if (!selectedGroup.id) {
      alert('Please select a group before deallocating.');
      return;
  }

  const updatedGroup = {
      ...selectedGroup,
      leader: null
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


return(
    <React.Fragment>
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0' }}>
        
    <FormControl variant="standard" style={{ minWidth: 240 }}>
            <InputLabel id="campus-label">Campus</InputLabel>
            <Select
                labelId="campus-label"
                id="campus-select"
                value={selectedCampus}
                onChange={handleCampusChange}
            >
                {CAMPUSES.map((campus) => (
                    <MenuItem key={campus.value} value={campus.value}>
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
                        value={selectedGroupType}
                        onChange={handleGroupTypeChange}
                    >
                        {GROUPTYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.value}
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
        {filteredAdults.map((adult) => (
            <MenuItem key={adult.id} value={adult}>
                {adult.adultName + ' ' + adult.adultSurname}
            </MenuItem>
        ))}
    </Select>
</FormControl>

    </div>
    <button onClick={handleAllocate} type="button">Allocate</button>
    <button onClick={handleDeallocate} type="button">Deallocate</button>
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
        {filteredGroups.map((campgroup) => (
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
