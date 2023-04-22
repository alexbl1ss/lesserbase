import React from 'react';
import Card from './Card';

function SearchList({ filteredPersons, handleCardClick }) {
  return (
    <div>
      {filteredPersons.map((person) => (
        <Card person={person} key={person.id} onClick={() => handleCardClick(person)} />
      ))}
    </div>
  );
}

export default SearchList;
