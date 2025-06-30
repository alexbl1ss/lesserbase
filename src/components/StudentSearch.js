import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../constants.js';
import SearchList from './SearchList.js';
import Scroll from './Scroll.js';
import MyTabs from './TabComponent/MyTabs.js';



function StudentSearch(props) {
  const [searchField, setSearchField] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [students, setStudents] = useState([]);
  const selectedYear = 2025;
  
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

  const handleCloseTabs = () => {
    setSelectedPerson(null);
    setSearchField("");
    fetchData();
  };

  const fetchData = () => {
    fetchStudents();
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

  const fetchStudents = useCallback(() => {
  setStudents([]); // Clear the existing students data first
  const token = sessionStorage.getItem('bearer');
  fetch(`${SERVER_URL}api/studentsBasicYear/${selectedYear}`, {
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
}, []);


  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  return (
    <section className="garamond">
      <form onReset={handleReset}>
        <div className="pa2">
          <input
            className="pa3 bb br3 grow b--none bg-lightest-blue ma3"
            type="search"
            placeholder="Search by student number..."
            style={{ width: "50%" }}
            value={searchField}
            onChange={handleChange}
          />
        </div>
        {searchList()}
        {showTabs()}
        <div>
          <p style={{ color: '#999999', fontSize: '10px' }}>
            Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
          </p>
        </div>
      </form>
    </section>
  );
}

export default StudentSearch;
