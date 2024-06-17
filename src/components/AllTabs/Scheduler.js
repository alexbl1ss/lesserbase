import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES, SCHEDULETYPE, ROLES } from '../../constants.js'
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import 'react-calendar/dist/Calendar.css';

function Scheduler(props) {
  const [campDates, setCampDates] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [adults, setAdults] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [previousSelectedDates, setPreviousSelectedDates] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('');
  const [scheduleType, setScheduleType] = useState('');


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

  const sortedDates = campDates.sort((a, b) => {
    return new Date(a.campDate) - new Date(b.campDate);
  });

  const fetchGroups = useCallback(() => {
    console.log("fetchGroups");
    console.log(filteredGroups);
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/campgroups`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        sessionStorage.setItem('campgroups', JSON.stringify(data));
        setAllGroups(data);
        setFilteredGroups(data);
        console.log(filteredGroups);
      })
      .catch(err => console.error(err));
  }, []);

  const fetchAdults = useCallback(() => {
    console.log('Fetching adults...');
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/adultswithstays`, {
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
    fetchDates();
    fetchGroups();
    fetchAdults();
  }, [fetchDates, fetchGroups, fetchAdults]);

  useEffect(() => {
    if (filteredGroups.length === 1) {
      const groupToSelect = filteredGroups[0];
      setSelectedItem(groupToSelect);
      handleItemChangeAfterSelection(groupToSelect);  // handle side effects
    } else if (filteredGroups.length === 0) {
      setSelectedItem('');
    }
  }, [filteredGroups]);

  useEffect(() => {
    if (campDates.length > 0 && selectedDates.length === campDates.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedDates, campDates]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDates(campDates);
    } else {
      setSelectedDates(selectedDates.filter(date => !campDates.some(campDate => campDate.id === date.id)));
    }
    setSelectAll(event.target.checked);
  };

  const handleScheduleTypeChange = (event) => {
    const newType = event.target.value;
    console.log("Schedule type changed to: ", newType);
    setScheduleType(newType);

    setSelectedItem('');
    setSelectedDates([]);
    setFilteredGroups([]);

    if (newType === 'STAFF') {
      setFilteredGroups(adults);
      setSelectedGroupType('');
    } else {
      setSelectedGroupType(GROUPTYPES[0]?.value || ''); // Ensure a valid default or empty
      filterItems(selectedCampus, GROUPTYPES[0]?.value || '');
    }
};

useEffect(() => {
  console.log(filteredGroups)
  const ids = filteredGroups.map(item => item.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error("Duplicate IDs detected:", ids);
  }
}, [filteredGroups]);

  const handleGroupTypeChange = (event) => {
    const groupType = event.target.value;
    setSelectedGroupType(groupType);
    filterItems(selectedCampus, groupType);
  };
  
  const handleCampusChange = (event) => {
    const campus = event.target.value;
    setSelectedCampus(campus);
    filterItems(campus, selectedGroupType);
  };
  
  const filterItems = (campus, type) => {
    let filtered = scheduleType === 'STAFF'
        ? adults.filter(adult => (!campus || adult.campus === campus) && (!type || adult.role === type))
        : allGroups.filter(group => (!campus || group.campus === campus) && (!type || group.groupType === type));

    setFilteredGroups(filtered);

    if (filtered.length > 0) {
        const firstItem = filtered[0];
        setSelectedItem(firstItem);
        handleItemChangeAfterSelection(firstItem);
    } else {
        setSelectedItem(null);
        setSelectedDates([]);
    }
  };
  
  const handleItemChangeAfterSelection = (item) => {
    if (!selectedItem || item.id !== selectedItem.id) {
      const datesWithItem = campDates.filter(date => 
        (scheduleType === 'STAFF' ? date.adults : date.groups).some(g => g.id === item.id)
      );
      setSelectedDates(datesWithItem);
      setPreviousSelectedDates(datesWithItem);
    }
  };
  
  const handleItemChange = (event) => {
    setSelectedItem(event.target.value);
    handleItemChangeAfterSelection(event.target.value);
  };

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

    const datesToPut = selectedDates.filter(date =>
      !previousSelectedDates.some(prevDate => prevDate.id === date.id)
    );

    const datesToDelete = previousSelectedDates.filter(prevDate =>
      !selectedDates.some(date => date.id === prevDate.id)
    );

    const putRequests = datesToPut.map(campdate => {
      // Determine the base URL based on the scheduleType
      const baseUrl = scheduleType === 'STAFF'
        ? `${SERVER_URL}api/adult/${selectedItem.id}/camptime/${campdate.id}`
        : `${SERVER_URL}api/campgroup/${selectedItem.id}/camptime/${campdate.id}`;
    
      return fetch(baseUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    });
    
    const deleteRequests = datesToDelete.map(campdate => {
      // Determine the base URL based on the scheduleType
      const baseUrl = scheduleType === 'STAFF'
        ? `${SERVER_URL}api/adult/${selectedItem.id}/camptime/${campdate.id}`
        : `${SERVER_URL}api/campgroup/${selectedItem.id}/camptime/${campdate.id}`;
    
      return fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    });
    

    Promise.all([...putRequests, ...deleteRequests])
      .then(responses => {
          console.log('All operations completed');
          setPreviousSelectedDates(selectedDates);
          fetchDates();
      })
      .catch(err => console.error('Error with scheduling operations:', err));
  };

  function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const dateChunks = chunkArray(sortedDates, 7);

  return(
    <React.Fragment>

    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0' }}>
      <FormControl variant="standard" style={{ minWidth: 240 }}>
        <InputLabel id="scheduleType-label">Schedule Type</InputLabel>
          <Select
            labelId="scheduleType-label"
            id="scheduleType-select"
            value={scheduleType}
            onChange={handleScheduleTypeChange}
          >
            {SCHEDULETYPE.map((stype) => (
              <MenuItem key={stype.value} value={stype.value}>
                {stype.value}
              </MenuItem>
            ))}
          </Select>
      </FormControl>
    </div>

    <h1>{scheduleType}</h1>
        
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
          <InputLabel id="role-group-type-label">{scheduleType === 'STAFF' ? 'Role' : 'Group Type'}</InputLabel>
            <Select
              labelId="role-group-type-label"
              id="role-group-type-select"
              value={selectedGroupType}
              onChange={handleGroupTypeChange} // Ensure this handler is correctly updating `selectedGroupType`
            >
            {(scheduleType === 'STAFF' ? ROLES : GROUPTYPES).map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
            </Select>
        </FormControl>

        <FormControl variant="standard" style={{ minWidth: 240 }}>
          <InputLabel id="item-label">
            {scheduleType === 'STAFF' ? 'Adult' : 'Group'}
          </InputLabel>
          <Select
            labelId="item-label"
            id="item-select"
            value={selectedItem}
            onChange={handleItemChange}
            renderValue={(selected) =>
            selected &&
            scheduleType === 'STAFF' &&
            selected.adultName &&
            selected.adultSurname &&
            selected.start &&
            selected.end
              ? `${selected.adultName} ${selected.adultSurname} (${selected.start} - ${selected.end})`
              : selected && selected.groupName
              ? selected.groupName
              : ''
            }
          >
          {filteredGroups.map((item) => (
            <MenuItem
              key={item.id}
              value={item}
            >
            {scheduleType === 'STAFF' && item.adultName && item.adultSurname && item.start && item.end
            ? `${item.adultName} ${item.adultSurname} (${item.start} - ${item.end})`
            : item.groupName
            ? item.groupName
            : 'No Name Available'}
            </MenuItem>
          ))}
          </Select>
        </FormControl>
    </div>
    <button onClick={handleSchedule} type="button">Schedule</button>
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '20px', marginBottom: '20px' }}>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
    <div style={{ margin: '10px' }}>
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAll}
    />
    <label>Select All Dates</label>
    <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
    <thead>
        <tr>
        <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
            <th>Date</th>
            <th>?</th>
        </tr>
    </thead>
    <tbody>
    {dateChunks.map((chunk) => (
        <tr key={chunk[0].id}>
            {chunk.map((campdate) => (
                <>
                    <td>{campdate.campDate}</td>
                    <td>
                        <input
                            type="checkbox"
                            checked={selectedDates.some(date => date.id === campdate.id)}
                            onChange={() => handleDatesSelect(campdate)}
                        />
                    </td>
                </>
            ))}
            {chunk.length < 7 ? <td colSpan={7 * (7 - chunk.length)}></td> : null}
        </tr>
    ))}
    </tbody>
</table>

    </div>
    <button onClick={handleSchedule}  type="button">Update Schedule</button>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
      </div>
     </div>
    </React.Fragment>
);
}

export default Scheduler;
