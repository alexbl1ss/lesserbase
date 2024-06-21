import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants';
import '../GroupCard.css';

function StudentGroups(props) {
  const { selectedPerson } = props;
  const [roomGroups, setRoomGroups] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [afternoonGroups, setAfternoonGroups] = useState([]);

  const fetchGroups = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/myGroupsToday/${selectedPerson.id}/2024-07-01`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch groups'))
    .then(data => {
      setRoomGroups(data.filter(group => group.groupType === "ROOM" || group.groupType === null));
      setClassGroups(data.filter(group => group.groupType === "CLASS"));
      setAfternoonGroups(data.filter(group => group.groupType === "AFTERNOON"));
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="detail-card payments-card" style={{ padding: '20px' }}>
      <section>
        <h3>Room:</h3>
        {roomGroups.length > 0 ? roomGroups.map(group => <p key={group.id}>{group.groupName}</p>) : <p>None</p>}
      </section>
      <section>
        <h3>Class:</h3>
        {classGroups.length > 0 ? classGroups.map(group =>
          <p key={group.id}>{group.groupName} - Teacher: {group.adultName} {group.adultSurname}</p>
        ) : <p>None</p>}
      </section>
      <section>
        <h3>Afternoon:</h3>
        {afternoonGroups.length > 0 ? afternoonGroups.map(group =>
          <p key={group.id}>{group.groupName} - Leader: {group.adultName} {group.adultSurname}</p>
        ) : <p>None</p>}
      </section>
      <p style={{ color: '#999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
      <p style={{ color: '#999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated')?.toString()}</p>
    </div>
  );
}

export default StudentGroups;
