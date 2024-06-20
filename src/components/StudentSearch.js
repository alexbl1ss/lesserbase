import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js';
import MyTabs from './TabComponent/MyTabs.js';
import SearchList from './SearchList.js';
import Scroll from './Scroll.js';
import AddStudent from './AddsEdits/AddStudent.js';
import CollapsibleTable from './CollapsibleTable.js';
import CollapsibleStudentTable from './CollapsibleStudentTable.js';

function StudentSearch(props) {
  const [searchField, setSearchField] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [students, setStudents] = useState([]);
  const [incompleteBookings, setIncompleteBookings] = useState([]);
  const [incompleteActivities, setIncompleteActivities] = useState([]);
  const [studentsWithoutStays, setStudentsWithoutStays] = useState([]);
  const [bookingsOutsideStays, setBookingsOutsideStays] = useState([]);
  const [missingTransfers, setMissingTransfers] = useState([]);
  const [outstandingBalances, setOutstandingBalances] = useState([]);

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
    fetchData();
  };

  const fetchData = () => {
    fetchStudents();
    fetchBookingsOutsideStay();
    fetchIncompleteBookings();
    fetchIncompleteActivities();
    fetchStudentsWithoutStays();
    fetchMissingTransfers();
    fetchOutstandingBalances();
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
    .then((response) => {
      if (response.status === 204) {
        return [];
      } else if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch incomplete bookings');
      }
    })
    .then((data) => {
      //console.log("Fetched incomplete bookings:", data);
      setIncompleteBookings(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };

  const fetchIncompleteActivities = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/IncompleteBookings/1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      if (response.status === 204) {
        return [];
      } else if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch incomplete activities');
      }
    })
    .then((data) => {
      //console.log("Fetched incomplete activities:", data);
      setIncompleteActivities(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };
  
  const fetchStudentsWithoutStays = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/studentsWithoutStays`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Fetched students without stays:", data);
      setStudentsWithoutStays(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };

  const fetchBookingsOutsideStay = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/bookingsOutsideStay`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Fetched students without stays:", data);
      setBookingsOutsideStays(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };

  const fetchMissingTransfers = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/missingTransfers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Fetched students without stays:", data);
      setMissingTransfers(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };
  
  const fetchOutstandingBalances = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/outstandingBalances`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Fetched students without stays:", data);
      setOutstandingBalances(data.length > 0 ? [...data] : []); // Ensure a new array reference
    })
    .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStudents();
    fetchIncompleteBookings();
    fetchIncompleteActivities();
    fetchStudentsWithoutStays();
    fetchBookingsOutsideStay();
    fetchMissingTransfers();
    fetchOutstandingBalances();
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
      return <MyTabs selectedPerson={selectedPerson} onClose={handleCloseTabs} showFinancials={props.showFinancials} />;
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
        return null;
      }
    })
    .then(newStudent => {
      if (newStudent) {
        fetchData();  // Refetch all data to reflect the new student addition
      }
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
        <CollapsibleStudentTable incompleteStudents={studentsWithoutStays} onSelectStudent={handleSelectStudent} title="Students without Stay details" />
        <CollapsibleStudentTable incompleteStudents={bookingsOutsideStays} onSelectStudent={handleSelectStudent} title="Students with Bookings outside Stay" />
        <CollapsibleStudentTable incompleteStudents={missingTransfers} onSelectStudent={handleSelectStudent} title="Students with missing Flights" />
        {props.showFinancials && (
                <CollapsibleStudentTable incompleteStudents={outstandingBalances} onSelectStudent={handleSelectStudent} title="Students with Outstanding Balances" />
            )}
        <CollapsibleTable incompleteBookings={incompleteBookings} onSelectStudent={handleSelectStudent} title="Incomplete Bookings" />
        <CollapsibleTable incompleteBookings={incompleteActivities} onSelectStudent={handleSelectStudent} title="Incomplete Activities" />
      </form>
    </section>
  );
}

export default StudentSearch;
