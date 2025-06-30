import React, { useState, useEffect, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SERVER_URL } from '../constants.js';
import './GroupSchedule.css';

function GroupSchedule({ username }) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [groups, setGroups] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [loggedStudents, setLoggedStudents] = useState({});

  useEffect(() => {
    const newFormattedDate = selectedDate.toISOString().split('T')[0];
    if (newFormattedDate !== formattedDate) {
      setFormattedDate(newFormattedDate);
    }
  }, [selectedDate, formattedDate]);

  const fetchGroups = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/mygroupsregister/${encodeURIComponent(username)}/${formattedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          setGroups([]);
          setCheckedState({});
          return;
        }

        const grouped = data.reduce((acc, curr) => {
          const name = curr.groupName;
          acc[name] = acc[name] || [];
          acc[name].push({
            id: curr.id,
            studentId: curr.studentId,
            studentName: curr.studentName,
            studentSurname: curr.studentSurname,
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
      })
      .catch(err => {
        console.error(err);
        setGroups([]);
        setCheckedState({});
      });
  }, [formattedDate, username]);

  const handleCheckboxChange = (groupName, studentId) => {
    setCheckedState(prevState => ({
      ...prevState,
      [groupName]: {
        ...prevState[groupName],
        [studentId]: !prevState[groupName][studentId],
      },
    }));
  };

  const changeDate = increment => {
    setSelectedDate(prevDate => dayjs(prevDate).add(increment, 'day'));
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const resetCheckboxes = () => {
    const resetState = Object.keys(checkedState).reduce((acc, groupName) => {
      acc[groupName] = Object.keys(checkedState[groupName]).reduce((innerAcc, studentId) => {
        innerAcc[studentId] = false;
        return innerAcc;
      }, {});
      return acc;
    }, {});
    setCheckedState(resetState);
  };

  const logCheckedStudents = groupName => {
    const actionString = Object.entries(checkedState[groupName])
      .map(([studentId, isChecked]) => {
        return `${studentId}:${isChecked ? 'present' : 'absent'}`;
      })
      .join(', ');

    const postData = {
      email: username,
      action: actionString,
    };

    const newLoggedStudents = { ...loggedStudents };
    Object.entries(checkedState[groupName]).forEach(([studentId, isChecked]) => {
      newLoggedStudents[studentId] = isChecked ? 'checked' : 'unchecked';
    });

    setLoggedStudents(newLoggedStudents);
    sendAttendanceData(postData);
  };

  const sendAttendanceData = postData => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/group/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to log attendance, server responded with status: ' + response.status);
        }
      })
      .then(data => {
        console.log('Attendance logged successfully:', data);
        resetCheckboxes();
      })
      .catch(err => {
        console.error('Error logging attendance:', err);
        alert('Error logging attendance: ' + err.message);
      });
  };

  return (
    <section className="section-container">
      <div className="date-picker-container">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Button variant="outlined" onClick={() => changeDate(-1)}>
              Prev
            </Button>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={params => <TextField {...params} />}
            />
            <Button variant="outlined" onClick={() => changeDate(1)}>
              Next
            </Button>
          </div>
        </LocalizationProvider>
      </div>
      <div className="tables-container">
        {Object.keys(groups).length === 0 ? (
          <p>No groups found for the selected date.</p>
        ) : (
          Object.entries(groups).map(([groupName, members]) => (
            <div key={groupName} className="table-responsive">
              <h3 className="group-title">{groupName}</h3>
              <table style={{ width: '100%', minWidth: '320px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th className="id">ID</th>
                    <th className="name">Name</th>
                    <th className="checkbox"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(student => (
                    <tr key={student.studentId}>
                      <td className="id">{student.studentId}</td>
                      <td className="name">
                        {student.studentName} {student.studentSurname}
                      </td>
                      <td className="checkbox">
                        <input
                          type="checkbox"
                          checked={checkedState[groupName]?.[student.studentId] || false}
                          onChange={() => handleCheckboxChange(groupName, student.studentId)}
                        />
                        {loggedStudents[student.studentId] === 'checked' ? (
                          <span style={{ color: 'green' }}>✔</span>
                        ) : null}
                        {loggedStudents[student.studentId] === 'unchecked' ? (
                          <span style={{ color: 'red' }}>✖</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="log-button" onClick={() => logCheckedStudents(groupName)}>
                Log Checked
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default GroupSchedule;
