import React from 'react';
import Card from './Card';

function SearchList({ filteredPersons, handleCardClick, maxCards }) {
  return (
    <div>
      {filteredPersons.length > maxCards && (
        <p>Showing only {maxCards} out of {filteredPersons.length} results</p>
      )}
      {filteredPersons.slice(0, maxCards).map((person) => (
        <Card person={person} key={person.id} onClick={() => handleCardClick(person)} />
      ))}
    </div>
  );
}

export default SearchList;
