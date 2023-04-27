import React from 'react';
 

function StudentDetail(props) {
  const { selectedPerson } = props;

  let imgPath;
  if (selectedPerson.studentGender === 'male') {
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

  const { id, studentName, studentSurname, dateAdded, mtRef, studentDob, studentGender, studentNationality, englishLevel, roomRequirements, photoPermissions, classRequirements, allergies, notes, arrivalDate, departureDate } = selectedPerson;


  return (
    <React.Fragment>
      <div className="detail-card">
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
    </React.Fragment>
  );
}

export default StudentDetail;
