import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function Scheduler(props) {
    const [campDates, setCampDates] = useState([]);
    const [campGroups, setCampGroups] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
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

    const fetchDates = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/camptimes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch camptimes');
        }
      })
      .then((data) => {
        sessionStorage.setItem('camptimes', JSON.stringify(data));
        setCampDates(data);
      })
      .catch((err) => console.error(err));
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
    fetchDates();
    fetchGroups();
  }, []);

  useEffect(() => {
    // This will log every time selectedGroup changes, showing the latest state after updates
    console.log("in effect ");
    console.log(selectedGroup);
}, [selectedGroup]); // useEffect to log changes correctly

  const sortedDates = campDates.sort((a, b) => {
    return new Date(a.campDate) - new Date(b.campDate);
  });
  
  
  const handleDatesSelect = useCallback((campdate) => {
    const isSelected = selectedDates.some(date => date.id === campdate.id);
    if (isSelected) {
        setSelectedDates(selectedDates.filter(date => date.id !== campdate.id));
    } else {
        setSelectedDates([...selectedDates, campdate]);
    }
}, [selectedDates]);


const handleSchedule = () => {
  const token = sessionStorage.getItem('bearer');

  // Create promises for PUT and DELETE requests
  const requests = campDates.map(campdate => {
      const isSelected = selectedDates.some(date => date.id === campdate.id);

      if (isSelected) {
          // Send PUT request if the date is selected
          return fetch(`${SERVER_URL}api/campgroup/${selectedGroup.id}/camptime/${campdate.id}`, {
              method: 'PUT',
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
          });
      } else {
          // Send DELETE request if the date is not selected
          return fetch(`${SERVER_URL}api/campgroup/${selectedGroup.id}/camptime/${campdate.id}`, {
              method: 'DELETE',
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
          });
      }
  });

  // Execute all requests and handle results
  Promise.all(requests)
      .then(responses => {
          // Handle responses here, e.g., check for errors, reload data, etc.
          console.log('All operations completed');
          fetchDates(); // Refresh dates after changes
      })
      .catch(err => console.error('Error with scheduling operations:', err));
};



  const handleChange = (event) => {
    const selectedGroup = event.target.value;
    setSelectedGroup(selectedGroup);

    const datesWithGroup = campDates.filter(date => 
        date.groups.some(group => group.id === selectedGroup.id)
    );
    setSelectedDates(datesWithGroup);
};


  return(
    <React.Fragment>
    <FormControl variant="standard" fullWidth>
        <InputLabel id="group-label">Group</InputLabel>
        <Select
            labelId="group-label"
            id="group-select"
            name="group"
            renderValue={(selected) => selected ? selected.groupName : ''}
            onChange={handleChange}
            >
            {campGroups.map((group) => (
                <MenuItem key={group.id} value={group}>
                    {group.groupName}
                </MenuItem>
             ))}
        </Select>
    </FormControl>
    <button onClick={handleSchedule} type="button">Schedule</button>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
      <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>schedule?</th>
          </tr>
        </thead>
        <tbody>
        {sortedDates.map((campdate) => (
          <tr key={campdate.id}>
          <td>{campdate.id}</td>
          <td>{campdate.campDate}</td>
          <td>
          <input
    type="checkbox"
    checked={selectedDates.some(date => date.id === campdate.id)}
    onChange={() => handleDatesSelect(campdate)}
/>

        </td>
      </tr>
    ))}
        </tbody>
      </table>
    </div>
    <button onClick={handleSchedule}  type="button">Create Schedule</button>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default Scheduler;
