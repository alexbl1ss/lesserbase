import React, { useState, useEffect, useCallback, useProps } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SERVER_URL } from '../constants.js';
import './WhoIsDoing.css';

function WhoIsDoing({username}) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [groups, setGroups] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loggedStudents, setLoggedStudents] = useState({});

  useEffect(() => {
    const newFormattedDate = selectedDate.toISOString().split('T')[0];
    if (newFormattedDate !== formattedDate) {
      setFormattedDate(newFormattedDate);
    }
  }, [selectedDate, formattedDate]);

  const fetchGroups = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/mygroupsregister/${username}/2024-07-01`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => response.json())
    .then(data => {
      const grouped = data.reduce((acc, curr) => {
          const name = curr.groupName;
          acc[name] = acc[name] || [];
          acc[name].push({
              id: curr.id,
              studentId: curr.studentId,
              studentName: curr.studentName,
              studentSurname: curr.studentSurname
          });
          return acc;
      }, {});
  
      const newCheckedState = Object.keys(grouped).reduce((acc, groupName) => {
          acc[groupName] = grouped[groupName].reduce((innerAcc, student) => {
              innerAcc[student.studentId] = false;
              return innerAcc;
          }, {});
          return acc;
      }, {});
  
      setGroups(grouped);
      setCheckedState(newCheckedState);
      setIsLoading(false);
  })
    .catch(err => console.error(err));
  }, [formattedDate]);

const handleCheckboxChange = (groupName, studentId) => {
  setCheckedState(prevState => ({
      ...prevState,
      [groupName]: {
          ...prevState[groupName],
          [studentId]: !prevState[groupName][studentId]
      }
  }));
};

const changeDate = (increment) => {
  setSelectedDate(prevDate => dayjs(prevDate).add(increment, 'day'));
};

  useEffect(() => {
    fetchGroups(formattedDate);
}, [formattedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const resetCheckboxes = () => {
    const resetState = Object.keys(checkedState).reduce((acc, groupName) => {
        acc[groupName] = Object.keys(checkedState[groupName]).reduce((innerAcc, studentId) => {
            innerAcc[studentId] = false;  // Reset each checkbox to false
            return innerAcc;
        }, {});
        return acc;
    }, {});
    setCheckedState(resetState);  // Update the state with the reset values
};

const logCheckedStudents = (groupName) => {
  console.log('Checked students for ', groupName, ': ', checkedState[groupName]);
  const newLoggedStudents = { ...loggedStudents };
  Object.keys(checkedState[groupName]).forEach(studentId => {
      // Set as 'checked' or 'unchecked' based on the checkbox state
      newLoggedStudents[studentId] = checkedState[groupName][studentId] ? "checked" : "unchecked";
  });
  setLoggedStudents(newLoggedStudents);
  resetCheckboxes();
};



return (
    <section className="garamond">
        {isLoading ? <p>Loading...</p> : (
            <>
                <div className="date-picker-container">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <Button variant="outlined" onClick={() => changeDate(-1)}>Prev</Button>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <Button variant="outlined" onClick={() => changeDate(1)}>Next</Button>
                        </div>
                    </LocalizationProvider>
                </div>
                <div style={{ margin: '0 auto', maxWidth: '100%' }}>
                    {Object.entries(groups).map(([groupName, members]) => (
                        <div key={groupName} className="table-responsive">
                            <h3 className="group-title">{groupName}</h3>
                            <table style={{ width: '100%', minWidth: '320px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Student Surname</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((student) => (
                                        <tr key={student.studentId}>
                                            <td>{student.studentId}</td>
                                            <td>{student.studentName}</td>
                                            <td>{student.studentSurname}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={checkedState[groupName]?.[student.studentId] || false}
                                                    onChange={() => handleCheckboxChange(groupName, student.studentId)}
                                                />
                                                {loggedStudents[student.studentId] === "checked" ? <span style={{ color: 'green' }}>✔</span> : null}
                                                {loggedStudents[student.studentId] === "unchecked" ? <span style={{ color: 'red' }}>✖</span> : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                className="log-button"
                                onClick={() => logCheckedStudents(groupName)}
                            >
                                Log Checked
                            </button>
                        </div>
                    ))}
                </div>
            </>
        )}
    </section>
);



}

export default WhoIsDoing;
