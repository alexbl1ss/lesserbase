import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js';
import MyTabs from './TabComponent/MyTabs.js';
import SearchList from './SearchList.js';
import Scroll from './Scroll.js';
import AddStudent from './AddsEdits/AddStudent.js';
import CollapsibleTable from './CollapsibleTable.js';

function StudentSearch(props) {
  const [searchField, setSearchField] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [students, setStudents] = useState([]);
  const [incompleteBookings, setIncompleteBookings] = useState([]);
  const [incompleteActivities, setIncompleteActivities] = useState([]);

  const filteredPersons = students.filter(
    (person) =>
      person.studentName?.toLowerCase().includes(searchField.toLowerCase()) ||
      person.studentSurname?.toLowerCase().includes(searchField.toLowerCase()) ||
      person.mtRef?.toLowerCase().includes(searchField.toLowerCase()) ||
      person.studentNationality?.toLowerCase().includes(searchField.toLowerCase()) ||
      person.id.toString().includes(searchField.toLowerCase())
  );

  const handleCardClick = (person) => {
    setSelectedPerson(person);
    setSearchShow(false);
  };

  const handleSelectStudent = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedPerson(student);
      setSearchShow(false);
    }
  };

  const handleCloseTabs = () => {
    setSelectedPerson(null);
    setSearchField("");
  };

  const searchList = () => {
    if (searchShow) {
      return (
        <Scroll>
          <SearchList
            filteredPersons={filteredPersons}
            handleCardClick={handleCardClick}
            maxCards={80}
          />
        </Scroll>
      );
    }
  };

  const fetchStudents = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/studentsBasic`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      if (response.status === 204) {
        return [];
      } else if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch students');
      }
    })
    .then((data) => {
      sessionStorage.setItem('students', JSON.stringify(data));
      setStudents(data);
    })
    .catch((err) => console.error(err));
  };

  const fetchIncompleteBookings = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/IncompleteBookings/0`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      setIncompleteBookings(data);
    })
    .catch((err) => console.error(err));
  };

  const fetchIncompleteActivities = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/IncompleteBookings/1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      setIncompleteActivities(data);
    })
    .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStudents();
    fetchIncompleteBookings();
    fetchIncompleteActivities();
  }, []);

  const handleChange = (e) => {
    setSearchField(e.target.value);
    setSearchShow(e.target.value !== "");
  };

  const handleReset = () => {
    setSearchField("");
    setSearchShow(false);
  };

  const showTabs = () => {
    if (selectedPerson !== null) {
      return <MyTabs selectedPerson={selectedPerson} onClose={handleCloseTabs} />;
    }
    return null;
  };

  const addStudent = (student) => {
    const token = sessionStorage.getItem("bearer");
    fetch(`${SERVER_URL}api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(student)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        alert('Something went wrong!');
      }
    })
    .then(() => {
      fetchStudents();
    })
    .catch(err => console.error(err));
  };

  return (
    <section className="garamond">
      <form onReset={handleReset}>
        <div className="pa2">
          <input
            className="pa3 bb br3 grow b--none bg-lightest-blue ma3"
            type="search"
            placeholder="Search by Name, Nationality, or Master Tracker ID..."
            style={{ width: "50%" }}
            value={searchField}
            onChange={handleChange}
          />
        </div>
        {searchList()}
        {showTabs()}
        <div>
          <AddStudent addStudent={addStudent} />
          <p style={{ color: '#999999', fontSize: '10px' }}>
            Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
          </p>
        </div>
        <CollapsibleTable incompleteBookings={incompleteBookings} onSelectStudent={handleSelectStudent} title="Incomplete Bookings" />
        <CollapsibleTable incompleteBookings={incompleteActivities} onSelectStudent={handleSelectStudent} title="Incomplete Activities" />
      </form>
    </section>
  );
}

export default StudentSearch;
