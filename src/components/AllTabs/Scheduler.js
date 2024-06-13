import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES } from '../../constants.js'
import '../BookingCard.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import InputIcon from "react-multi-date-picker/components/input_icon"

function Scheduler(props) {
  const [campDates, setCampDates] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedConvertedDates, setSelectedConvertedDates] = useState([]);
  const [previousSelectedDates, setPreviousSelectedDates] = useState([]);

  const fetchDates = useCallback(() => {
    console.log("when does fetchDates get called?")
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

  const convertedCampDates = campDates.map(date => {
    console.log("when does convertedCampDates get called?")
    return {
      ...date,
      campDate: new Date(date.campDate)
    };
  });

  const sortedDates = campDates.sort((a, b) => {
    console.log("is sortedDates called?")
    return new Date(a.campDate) - new Date(b.campDate);
  });

  const fetchGroups = useCallback(() => {
    console.log("when does fetchGroups get called?")
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/campgroups`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        sessionStorage.setItem('campgroups', JSON.stringify(data));
        setAllGroups(data);
        setFilteredGroups(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    console.log("fetcher effect");
    fetchDates();
    fetchGroups();
  }, [fetchDates, fetchGroups]);

  useEffect(() => {
    console.log("group change effect");
    if (filteredGroups.length === 1) {
      const groupToSelect = filteredGroups[0];
      setSelectedGroup(groupToSelect);
      handleGroupChangeAfterSelection(groupToSelect);  // handle side effects
    } else if (filteredGroups.length === 0) {
      setSelectedGroup('');
    }
  }, [filteredGroups]);

  useEffect(() => {
    console.log("dates effect");
    if (campDates.length > 0 && selectedDates.length === campDates.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedDates, campDates]);

  const handleSelectAll = (event) => {
    console.log("select all dates")
    if (event.target.checked) {
      setSelectedDates(campDates);
    } else {
      setSelectedDates(selectedDates.filter(date => !campDates.some(campDate => campDate.id === date.id)));
    }
    setSelectAll(event.target.checked);
  };

  const handleGroupTypeChange = (event) => {
    console.log("handleGroupTypeChange")
    const groupType = event.target.value;
    setSelectedGroupType(groupType);
    filterGroups(selectedCampus, groupType);
  };
  
  const handleCampusChange = (event) => {
    console.log("handleCampusChange")
    const campus = event.target.value;
    setSelectedCampus(campus);
    filterGroups(campus, selectedGroupType);
  };
  
  const filterGroups = (campus, groupType) => {
    console.log("filterGroups")
    const filtered = allGroups.filter(group => {
        return (!campus || group.campus === campus) && (!groupType || group.groupType === groupType);
    });
    setFilteredGroups(filtered);
  
    if (filtered.length > 0) {
      const firstGroup = filtered[0];
      setSelectedGroup(firstGroup);
      handleGroupChangeAfterSelection(firstGroup);
    } else {
      setSelectedGroup('');
      setSelectedDates([]);
    }
  };
  
  const handleGroupChangeAfterSelection = (group) => {
    console.log("handleGroupChangeAfterSelection")  

    if (!selectedGroup || group.id !== selectedGroup.id) {
      const datesWithGroup = campDates.filter(date => 
        date.groups.some(g => g.id === group.id)
      );
      setSelectedDates(datesWithGroup);
      setPreviousSelectedDates(datesWithGroup);

      console.log("selected dates");
      console.log(selectedDates);
      console.log("Pre selected dates");
      console.log(previousSelectedDates);

      const ConvertedDatesWithGroup = convertedCampDates.filter(date => 
        date.groups.some(g => g.id === group.id)
      );

      setSelectedConvertedDates(ConvertedDatesWithGroup.map(date => date.campDate));
    }
    console.log("selected dates (converted)");
    console.log(selectedConvertedDates)
};

const handleGroupChange = (event) => {
  console.log("handleGroupChangeAfterSelection")
  const group = event.target.value;
  setSelectedGroup(group);
  handleGroupChangeAfterSelection(group);
};

const handleDatesSelect = useCallback((campdate) => {
    console.log("When is handleDatesSelect called?")
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
    return fetch(`${SERVER_URL}api/campgroup/${selectedGroup.id}/camptime/${campdate.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  });

  const deleteRequests = datesToDelete.map(campdate => {
    return fetch(`${SERVER_URL}api/campgroup/${selectedGroup.id}/camptime/${campdate.id}`, {
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
          console.log("Pre selected dates");
          console.log(previousSelectedDates);
          fetchDates();
      })
      .catch(err => console.error('Error with scheduling operations:', err));
};

const theme = createTheme({
  components: {
    MuiCalendarPicker: {
      styleOverrides: {
        day: ({ ownerState, theme }) => {
          const isSelected = selectedDates.some(
            selectedDate => selectedDate && selectedDate.toISOString().slice(0, 10) === ownerState.day.toISOString().slice(0, 10)
          );
          return {
            ...(isSelected && {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
            }),
          };
        },
      },
    },
  },
});

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
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '20px', marginBottom: '20px' }}>
    <div style={{ gridRow: '1', position: 'relative', zIndex: 1000 }}>
        <DatePicker
            range
            placeholderText="Scheduler"
            render={<InputIcon/>}
            plugins={[<DatePanel />]}
            multiple
            value={selectedConvertedDates}
            style={{ width: "100%", fontSize: "1.25rem" }}
        />
    </div>
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
