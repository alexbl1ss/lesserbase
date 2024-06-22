import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SERVER_URL } from '../constants.js';
import './WhoIsDoing.css';
import Button from '@mui/material/Button';



function WhoIsDoing() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [groups, setGroups] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const newFormattedDate = selectedDate.toISOString().split('T')[0];
    if (newFormattedDate !== formattedDate) {
      setFormattedDate(newFormattedDate);
    }
  }, [selectedDate, formattedDate]);

  const fetchGroups = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/mygroupsregister/alex.brown@bliss.com/2024-07-01`, {
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
  
      console.log(grouped, newCheckedState);  // Confirm that the state is correctly set
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


  return (
    <section className="garamond">
        {isLoading ? <p>Loading...</p> : (
            <>
                <div className="date-picker-container">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <div style={{ marginLeft: '50px' }}>
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
    className="log-button"
    onClick={() => {
        console.log('Checked students for ', groupName, ': ', checkedState[groupName]);
        resetCheckboxes();  // Call the reset function after logging
    }}
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
