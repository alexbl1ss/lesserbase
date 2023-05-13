import React, { useState, useEffect, useCallback } from 'react';
import EditStudent from '../AddsEdits/EditStudent';
import { SERVER_URL } from '../../constants.js'


function StudentDetail(props) {
  const { selectedPerson } = props;
  const [student, setStudent] = useState([]);

  const fetchStudent = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/students/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch student');
        }
      })
      .then((data) => {
        sessionStorage.setItem('bookings', JSON.stringify(data));
        setStudent(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  let imgPath;
  if (student.studentGender === 'male') {
    const maleImgPaths = [
      "/assets/img/1.png",
      "/assets/img/3.png",
      "/assets/img/6.png",
      "/assets/img/8.png"
    ];
      imgPath = process.env.PUBLIC_URL + maleImgPaths[Math.floor(Math.random() * maleImgPaths.length)];
  } else {
    const femaleImgPaths = [
      "/assets/img/2.png",
      "/assets/img/4.png",
      "/assets/img/5.png",
      "/assets/img/7.png"];
    imgPath = process.env.PUBLIC_URL + femaleImgPaths[Math.floor(Math.random() * femaleImgPaths.length)];
  }

  const { id, 
    studentName, 
    studentSurname, 
    dateAdded, 
    mtRef, 
    studentDob, 
    studentGender, 
    studentNationality, 
    englishLevel, 
    roomRequirements, 
    photoPermissions, 
    classRequirements, 
    allergies, 
    notes, 
    arrivalDate, 
    departureDate } = student;


  const editStudent = (student, id) => {

    const token = sessionStorage.getItem("bearer"); 

     fetch(`${SERVER_URL}api/students/${id}`,
       { method: 'PUT', headers: {
         'Content-Type':'application/json',
         'Authorization' : `Bearer ${token}`
       },
       body: JSON.stringify(student)
     })
     .then(response => {
       if (response.ok) {
         fetchStudent();
       }
       else {
         alert('Something went wrong!');
       }
     })
   .catch(err => console.error(err))
  }

  return (
    <React.Fragment>
      <div className="detail-card" style={{ padding: '20px 0' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td rowSpan="2" style={{ textAlign: 'center' }}><img className="br-100 h3 w3 dib" alt={selectedPerson.id} src={imgPath} /></td>
              <td>DB ref: {id}</td>
              <td>Added: {dateAdded}</td>
              <td>Master Tracker: {mtRef}</td>
            </tr>
            <tr>
              <td>Nationality: {studentNationality}</td>
              <td>Dob: {studentDob}</td>
              <td>Gender: {studentGender}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>{studentName} {studentSurname}</td>
              <td>English level: {englishLevel}</td>
              <td>Arrives: {arrivalDate}</td>
              <td>Departs: {departureDate}</td>
            </tr>
            <tr style={{ height: '50px' }}><td colSpan="4" > </td></tr>
            <tr><td>Room Requirements: </td><td colSpan="3">{roomRequirements}</td></tr>
            <tr><td>Class Requirements: </td><td colSpan="3">{classRequirements}</td></tr>
            <tr><td>Allergies: </td><td colSpan="3">{allergies}</td></tr>
            <tr><td>Notes: </td><td colSpan="3">{notes}</td></tr>
            <tr><td>Photo Permissions: </td><td colSpan="3">{photoPermissions}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}
        <EditStudent passedStudent={student} editStudent={editStudent} />
        </p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
  );
}

export default StudentDetail;
