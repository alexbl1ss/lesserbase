import React, { useState, useEffect, useCallback } from 'react';
import EditStudent from '../AddsEdits/EditStudent';
import { SERVER_URL } from '../../constants.js'

function StudentDetail(props) {
  const { selectedPerson, selectedStay, setSelectedStay } = props;
  const [student, setStudent] = useState(null);
  const [stays, setStays] = useState([]);

  const fetchStays = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/student/${selectedPerson.id}/stays`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) {
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch stays');
        }
      })
      .then((data) => {
        setStays(data);
        // Automatically select the most recent stay if none is currently selected
        if (!selectedStay && data.length > 0) {
          setSelectedStay(data[data.length - 1]);  // Set to the most recent stay
          //console.log(selectedStay);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id, selectedStay, setSelectedStay]);

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
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchStudent();
    fetchStays();
  }, [fetchStudent, fetchStays]);

  let imgPath;
  if (student && student.studentGender === 'male') {
    const maleImgPaths = [
      "/assets/img/1.png",
      "/assets/img/3.png",
      "/assets/img/6.png",
      "/assets/img/8.png"
    ];
    imgPath = process.env.PUBLIC_URL + maleImgPaths[Math.floor(Math.random() * maleImgPaths.length)];
  } else if (student) {
    const femaleImgPaths = [
      "/assets/img/2.png",
      "/assets/img/4.png",
      "/assets/img/5.png",
      "/assets/img/7.png"
    ];
    imgPath = process.env.PUBLIC_URL + femaleImgPaths[Math.floor(Math.random() * femaleImgPaths.length)];
  }

  const {
    id, 
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
    departureDate,
    hasPoolPermission,
    hasPhotoPermission,
    hasMedicalPermission,
    hasHospitalPermission,
    hasExcursionPermission,
    hasActivityPermission,
    hasSupervisionPermission
  } = student || {};

  const editStudent = (student, id) => {
    const token = sessionStorage.getItem("bearer"); 
    fetch(`${SERVER_URL}api/students/${id}`, {
      method: 'PUT', 
      headers: {
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
              <td colSpan="2"></td>
            </tr>
            <tr style={{ height: '50px' }}><td colSpan="4" > </td></tr>
            <tr><td>Room Requirements: </td><td colSpan="3">{roomRequirements}</td></tr>
            <tr><td>Class Requirements: </td><td colSpan="3">{classRequirements}</td></tr>
            <tr><td>Allergies: </td><td colSpan="3">{allergies}</td></tr>
            <tr><td>Notes: </td><td colSpan="3">{notes}</td></tr>
            <tr>
              <td colSpan="2">Permissions:</td>
              <td>Photo:</td>
              <td>{hasPhotoPermission ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>Medical:</td>
              <td>{hasMedicalPermission ? 'Yes' : 'No'}</td>
              <td>Hospital:</td>
              <td>{hasHospitalPermission ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>Excursion:</td>
              <td>{hasExcursionPermission ? 'Yes' : 'No'}</td>
              <td>Activity:</td>
              <td>{hasActivityPermission ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>Supervision:</td>
              <td>{hasSupervisionPermission ? 'Yes' : 'No'}</td>
              <td>Pool:</td>
              <td>{hasPoolPermission ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <div style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}
          <EditStudent passedStudent={student} editStudent={editStudent} />
        </div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Selected Stay: {selectedStay ? selectedStay.stayId : 'None'}</p>
        <div style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated') ? 'Yes' : 'No'}</div>
      </div>
    </React.Fragment>
  );
}

export default StudentDetail;
