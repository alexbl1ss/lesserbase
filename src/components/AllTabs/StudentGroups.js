import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants';
import '../GroupCard.css';

function StudentGroups(props) {
  const { selectedPerson } = props;
  const [roomGroups, setRoomGroups] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [afternoonGroups, setAfternoonGroups] = useState([]);
  const [afternoonBookings, setAfternoonBookings] = useState([]);
  const [classBookings, setClassBookings] = useState([]);
  const [otherBookings, setOtherBookings] = useState([]);
  const[transfers, setTransfers] = useState([]);
  const [todayTransfers, setTodayTransfers] = useState([]);
  

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Use today's date as initial state
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));


  const fetchGroups = useCallback(() => {
    console.log("selectedPerson.id:", selectedPerson?.id, "selectedDate:", selectedDate);

    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/myGroupsToday/${selectedPerson.id}/${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(async response => {
      if (!response.ok) throw new Error('Failed to fetch groups');
      const text = await response.text();
      return text ? JSON.parse(text) : [];
    })
    .then(data => {
      setRoomGroups(data.filter(group => group.groupType === "ROOM" || group.groupType === null));
      setClassGroups(data.filter(group => group.groupType === "CLASS"));
      setAfternoonGroups(data.filter(group => group.groupType === "AFTERNOON"));
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, selectedDate]);

  const fetchBookings = useCallback(() => {
    console.log("selectedPerson.id:", selectedPerson?.id, "selectedDate:", selectedDate);

    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/whatamidoing/${selectedPerson.id}/${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(async response => {
      if (!response.ok) throw new Error('Failed to fetch groups');
      const text = await response.text();
      return text ? JSON.parse(text) : [];
    })
    .then(data => {
      setOtherBookings(data.filter(group => group.groupType === "RESIDENTIAL" || group.groupType === "EXTRA"  || group.groupType === "UNKNOWN"));
      setClassBookings(data.filter(group => group.groupType === "RESIDENTIAL"));
      setAfternoonBookings(data.filter(group => group.groupType === "AFTERNOON" || group.groupType === "WEEKEND" || group.groupType === "EXTERNAL"));
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, selectedDate]);
  
  const fetchTransfers = useCallback(() => {
    console.log("selectedPerson.id:", selectedPerson?.id, "selectedDate:", selectedDate);

    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/transfers/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(async response => {
      if (!response.ok) throw new Error('Failed to fetch transfers');
      const text = await response.text();
      return text ? JSON.parse(text) : [];
    })
    .then(data => {
      sessionStorage.setItem('payments', JSON.stringify(data));
      setTransfers(data);
      const todayTransfers = data.filter(transfer => formatDate(new Date(transfer.transferDate)) === selectedDate);
      setTodayTransfers(todayTransfers);
    })
    .catch(err => console.error(err));
  }, [selectedPerson.id, selectedDate]);

  const shiftDate = (deltaDays) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const newDate = new Date(year, month - 1, day); // JS months are 0-based
    newDate.setDate(newDate.getDate() + deltaDays);
    setSelectedDate(formatDate(newDate));
  };

  useEffect(() => {
    fetchGroups();
    fetchTransfers();
    fetchBookings();
  }, [fetchGroups, fetchTransfers, fetchBookings]);

  return (
    <div className="detail-card payments-card" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '15px' }}>
        <button type="button" onClick={() => shiftDate(-1)}>←</button>
        <span style={{ margin: '0 10px' }}>{selectedDate}</span>
        <button type="button" onClick={() => shiftDate(1)}>→</button>
      </div>
      <section>
        <h3>Room:</h3>
        {roomGroups.length > 0 ? roomGroups.map(group => <p key={group.id}>{group.groupName}</p>) : <p>Not Allocated yet</p>}
      </section>
      {todayTransfers.length > 0 ? (
        <section>
          <h3>Flight Today:</h3>
          {todayTransfers.map(transfer => (
            <div key={transfer.id}>
              <p>Depart: {transfer.depart} at {transfer.departureTime}</p>
              <p>Arrive: {transfer.arrive} at {transfer.arrivalTime}</p>
              <p>Flight No: {transfer.flightId}</p>
            </div>  
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
