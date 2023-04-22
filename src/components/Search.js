import React, { useState, useEffect } from 'react';
import Scroll from './Scroll';
import SearchList from './SearchList';
import DetailCard from './DetailCard';
import BookingCard from './BookingCard';
import AgentsCard from './AgentsCard';
import { SERVER_URL } from '../constants.js'


function Search() {
  const [searchField, setSearchField] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  };

  const filteredPersons = students.filter(
    (person) =>
      person.studentName.toLowerCase().includes(searchField.toLowerCase()) ||
      person.studentSurname.toLowerCase().includes(searchField.toLowerCase()) ||
      person.mtRef.toLowerCase().includes(searchField.toLowerCase()) ||
      person.studentNationality.toLowerCase().includes(searchField.toLowerCase())
  );

  const handleChange = (e) => {
    setSearchField(e.target.value);
    if (e.target.value === "") {
      setSearchShow(false);
    } else {
      setSearchShow(true);
    }
  };

  const handleCardClick = (person) => {
    setSelectedPerson(person);
    setSearchShow(false);
  };

  const searchList = () => {
    if (searchShow) {
      return (
        <Scroll>
          <SearchList
            filteredPersons={filteredPersons}
            handleCardClick={handleCardClick}
          />
        </Scroll>
      );
    }
  };

  //this is the handle close for detail card
  const handleClose = () => {
    setSelectedPerson(null);
    setSearchShow(true);
    fetchStudents();
  };

  const detailCard = () => {
  if (selectedPerson) {
    return (
      <div className="detail-card-container">
        <DetailCard person={selectedPerson} onClose={handleClose} />
        <BookingCard person={selectedPerson} />
        <AgentsCard person={selectedPerson} />
      </div>
    );
  }
};
   return (
    <section className="garamond">
      <div className="navy georgia ma0 grow">
        <h2 className="f2">Search for Students</h2>
      </div>
      <div className="pa2">
        <input
          className="pa3 bb br3 grow b--none bg-lightest-blue ma3"
          type="search"
          placeholder="Search People"
          onChange={handleChange}
        />
      </div>
      {searchList()}
      {detailCard()}
    </section>
  );
}


export default Search;
