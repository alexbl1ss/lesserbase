import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import EditStudent from '../AddsEdits/EditStudent';
import DetailCard from './DetailCard.css'

function StudentDetail(props) {
  const { selectedPerson, selectedStay, setSelectedStay } = props;
  const [student, setStudent] = useState(null);
  
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
    classRequirements, 
    allergies, 
    notes, 
    hasPoolPermission,
    hasPhotoPermission,
    hasMedicalPermission,
    hasHospitalPermission,
    hasExcursionPermission,
    hasActivityPermission,
    hasSupervisionPermission,
    emergencyContact,
    mobilePhoneOptOut
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

  const allPermissionsGranted = hasPhotoPermission && hasMedicalPermission && hasHospitalPermission && 
  hasExcursionPermission && hasActivityPermission && hasSupervisionPermission && 
  hasPoolPermission;

return (
<React.Fragment>
<div className="detail-card">
<table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
<tbody>
<tr>
<td rowSpan="4" style={{ textAlign: 'center' }}><img className="br-100 h3 w3 dib" alt={selectedPerson.id} src={imgPath} /></td>
<td>Number: {id}</td>
</tr>
<tr>
<td>{studentName} {studentSurname}</td>
</tr>
<tr>
<td>Nationality: {studentNationality}</td>
</tr>
<tr>
<td>Date of Birth: {studentDob}</td>
</tr>
<tr>
<td>Gender: {studentGender}</td>
<td>English Level: {englishLevel}</td>
</tr>
<tr>
<td>Allergies: </td>
<td>{allergies}</td>
</tr>
<tr>
<td>Notes: </td>
<td>{notes}</td>
</tr>
<tr>
  <td>Emergency Contact: </td>
  <td>{emergencyContact || 'N/A'}</td>
</tr>
<tr>
  <td>Mobile Phone Opt-Out:</td>
  <td>{mobilePhoneOptOut ? 'Yes' : 'No'}</td>
</tr>
<tr style={{ height: '50px' }}><td colSpan="2" > </td></tr>
{allPermissionsGranted ? (
<tr>
<td colSpan="2">All Permissions Granted</td>
</tr>
) : (
<>
{!hasPhotoPermission && <tr><td colSpan="2">No Photos</td></tr>}
{!hasMedicalPermission && <tr><td colSpan="2">No Medical</td></tr>}
{!hasHospitalPermission && <tr><td colSpan="2">No Hospital</td></tr>}
{!hasExcursionPermission && <tr><td colSpan="2">No Excursions</td></tr>}
{!hasActivityPermission && <tr><td colSpan="2">No Activities</td></tr>}
{!hasSupervisionPermission && <tr><td colSpan="2">No Supervision</td></tr>}
{!hasPoolPermission && <tr><td colSpan="2">No Pool</td></tr>}
</>
)}
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
