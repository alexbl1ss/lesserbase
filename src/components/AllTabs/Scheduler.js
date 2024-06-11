import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES } from '../../constants.js'
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function Scheduler(props) {
  const [campDates, setCampDates] = useState([]);
  const [allGroups, setAllGroups] = useState([]);  // All groups fetched from the server
  const [filteredGroups, setFilteredGroups] = useState([]); // Groups filtered based on campus and group type
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('');
  const [selectAll, setSelectAll] = useState(false);


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
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem('campgroups', JSON.stringify(data));
            setAllGroups(data);
            setFilteredGroups(data);  // Initially no filter, so show all groups
        })
        .catch(err => console.error(err));
}, []);

useEffect(() => {
  fetchDates();
  fetchGroups();
}, [fetchDates, fetchGroups]);

useEffect(() => {
  // Automatically select the first group if there's only one after filtering
  if (filteredGroups.length === 1) {
    const groupToSelect = filteredGroups[0];
    setSelectedGroup(groupToSelect);
    handleGroupChangeAfterSelection(groupToSelect);  // handle side effects
  } else if (filteredGroups.length === 0) {
    setSelectedGroup('');
  }
}, [filteredGroups]);

useEffect(() => {
  // Check if all current visible dates are selected
  if (campDates.length > 0 && selectedDates.length === campDates.length) {
    setSelectAll(true);
  } else {
    setSelectAll(false);
  }
}, [selectedDates, campDates]);


const handleSelectAll = (event) => {
  if (event.target.checked) {
    // Add all displayed dates to selectedDates
    setSelectedDates(campDates);
  } else {
    // Remove all displayed dates from selectedDates
    setSelectedDates(selectedDates.filter(date => !campDates.some(campDate => campDate.id === date.id)));
  }
  setSelectAll(event.target.checked);
};



// Function to handle additional logic when a group is automatically selected
const handleGroupChangeAfterSelection = (group) => {
  // Assuming you need to filter or set dates or other related state changes
  const datesWithGroup = campDates.filter(date => 
    date.groups.some(g => g.id === group.id)
  );
  setSelectedDates(datesWithGroup);
};

const handleGroupTypeChange = (event) => {
  const groupType = event.target.value;
  setSelectedGroupType(groupType);
  filterGroups(selectedCampus, groupType);
};

const handleCampusChange = (event) => {
  const campus = event.target.value;
  setSelectedCampus(campus);
  filterGroups(campus, selectedGroupType);
};

const filterGroups = (campus, groupType) => {
  const filtered = allGroups.filter(group => {
      return (!campus || group.campus === campus) && (!groupType || group.groupType === groupType);
  });
  setFilteredGroups(filtered);

  if (filtered.length > 0) {
    const firstGroup = filtered[0];
    setSelectedGroup(firstGroup); // Ensure this updates the Select component
    handleGroupChangeAfterSelection(firstGroup);
  } else {
    setSelectedGroup(''); // Reset if no groups are available after filter
    setSelectedDates([]); // Clear selected dates when no groups match the filter
  }
};


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

const handleGroupChange = (event) => {
  const group = event.target.value;
  setSelectedGroup(group);
  handleGroupChangeAfterSelection(group);
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
            <InputLabel id="group-label">Group</InputLabel>
            <Select
                abelId="group-label"
                        id="group-select"
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        renderValue={(selected) => selected ? selected.groupName : ''}
            >
                {filteredGroups.map((group) => (
                    <MenuItem key={group.id} value={group}>
                        {group.groupName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </div>
    <button onClick={handleSchedule} type="button">Schedule</button>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
    <div style={{ margin: '10px' }}>
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAll}
    />
    <label>Select All Dates</label>
  </div><table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
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
