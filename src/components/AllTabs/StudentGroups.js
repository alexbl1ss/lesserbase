import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants';
import '../GroupCard.css';

function StudentGroups(props) {
  const { selectedPerson } = props;
  const [roomGroups, setRoomGroups] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [afternoonGroups, setAfternoonGroups] = useState([]);
  const [classBookings, setClassBookings] = useState([]);
  const [afternoonBookings, setAfternoonBookings] = useState([]);
  const [otherBookings, setOtherBookings] = useState([]);
  const[transfers, setTransfers] = useState([]);
  const [todayTransfers, setTodayTransfers] = useState([]);

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Use today's date
  const today = formatDate(new Date());


  const fetchGroups = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/myGroupsToday/${selectedPerson.id}/${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch groups'))
    .then(data => {
      setRoomGroups(data.filter(group => group.groupType === "ROOM" || group.groupType === null));
      setClassGroups(data.filter(group => group.groupType === "CLASS"));
      setAfternoonGroups(data.filter(group => group.groupType === "AFTERNOON"));
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, today]);

  const fetchBookings = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whatamidoing/${selectedPerson.id}/${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch groups'))
    .then(data => {
      setOtherBookings(data.filter(group => group.groupType === "RESIDENTIAL" || group.groupType === "EXTRA"  || group.groupType === "UNKNOWN"));
      setClassBookings(data.filter(group => group.groupType === "RESIDENTIAL"));
      setAfternoonBookings(data.filter(group => group.groupType === "AFTERNOON" || group.groupType === "WEEKEND" || group.groupType === "EXTERNAL"));
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, today]);
  
  const fetchTransfers = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/transfers/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch transfers'))
    .then(data => {
      sessionStorage.setItem('payments', JSON.stringify(data));
      setTransfers(data);
      const todayTransfers = data.filter(transfer => formatDate(new Date(transfer.transferDate)) === today);
      setTodayTransfers(todayTransfers);
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, today]);

  useEffect(() => {
    fetchGroups();
    fetchTransfers();
    fetchBookings();
  }, [fetchGroups, fetchTransfers, fetchBookings]);


  return (
    <div className="detail-card payments-card" style={{ padding: '20px' }}>
      <section>
        <h3>Room:</h3>
        {roomGroups.length > 0 ? roomGroups.map(group => <p key={group.id}>{group.groupName}</p>) : <p>Not Allocated yet</p>}
      </section>
      {todayTransfers.length > 0 ? (
        <section>
          <h3>Flight Today:</h3>
          {todayTransfers.map(transfer => (
            <p key={transfer.id}>
              <p>Depart: {transfer.depart} at {transfer.departureTime}</p>
              <p>Arrive: {transfer.arrive} at {transfer.arrivalTime}</p>
              <p>Flight No: {transfer.flightId}</p>
            </p>
          ))}
        </section>
      ) : (
        <>
          <section>
            <h3>Class:</h3>
            {classGroups.length > 0 ? classGroups.map(group =>
              <p key={group.id}>{group.groupName} - Teacher: {group.adultName} {group.adultSurname}</p>
            ) : <p>Not Allocated yet</p>}
          </section>
          <section>
            <h3>Afternoon:</h3>
            {afternoonGroups.length > 0 ? (
              afternoonGroups.map(group =>
                <p key={group.id}>{group.groupName} - Leader: {group.adultName} {group.adultSurname}</p>
              )
            ) : (
              afternoonBookings.length > 0 ? (
                afternoonBookings.map(booking =>
                  <p key={booking.id}>
                    Activity: {booking.groupName} 
                    {booking.groupType === "EXTERNAL" ? ` - ${booking.groupType}` : ""}
                  </p>
                )
              ) : <p>NONE</p>
              
            )}
          </section>
        </>
      )}
      <p style={{ color: '#999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
      <p style={{ color: '#999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated')?.toString()}</p>
    </div>
  );

}

export default StudentGroups;
