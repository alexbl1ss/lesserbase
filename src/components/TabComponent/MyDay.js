import React, { useState, useCallback, useEffect } from "react";
import { SERVER_URL, CUTOFF_DATE } from "../../constants";

const MyDay = (props) => {
    
    const { selectedPerson } = props;
    const [student, setStudent] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    

    const fetchStudent = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/students/${selectedPerson.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            if (response.status === 204) {
              return null;
            } else if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch student');
            }
          })
          .then((data) => {
            setStudent(data);
          })
          .catch((err) => console.error(err));
    }, [selectedPerson]);

    const fetchBookings = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/student/${selectedPerson.id}/booking`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            if (response.status === 204) {
              return [];
            } else if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch bookings');
            }
          })
          .then((data) => {
            const filteredData = data.filter(booking => 
              booking.startDate === null || new Date(booking.startDate) > new Date(CUTOFF_DATE)
            );
            sessionStorage.setItem('bookings', JSON.stringify(filteredData));
            setBookings(filteredData);
          })
          .catch((err) => console.error(err));
      }, [selectedPerson]);

      const fetchMyGroups = useCallback(() => {
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/myGroupsToday/${selectedPerson.id}/2024-07-01`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            if (response.status === 204) {
              return [];
            } else if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch bookings');
            }
          })
          .then((data) => {
            const filteredData = data.filter(booking => 
              booking.startDate === null || new Date(booking.startDate) > new Date(CUTOFF_DATE)
            );
            sessionStorage.setItem('bookings', JSON.stringify(filteredData));
            setBookings(filteredData);
          })
          .catch((err) => console.error(err));
      }, [selectedPerson]);

      useEffect(() => {
        fetchStudent();
        fetchBookings();
        fetchMyGroups();
      }, [fetchStudent, fetchBookings, fetchMyGroups]);
    
      return (
        <div>
            this is my day: {selectedPerson && selectedPerson.studentName}
            student: {student && student.studentName}
        </div>
    );
    
}

export default MyDay