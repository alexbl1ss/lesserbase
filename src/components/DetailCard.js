import React from 'react';
import './DetailCard.css';
import AddPayment from './AddPayment';

function DetailCard({ person, onClose }) {

  let imgPath;
  if (person.studentGender === 'male') {
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

  const addPayment = (payment) => {
    console.log("doing nothing for now")
    console.log(payment.studentid)
    console.log(payment.paymentamount)
    console.log(payment.paymentaccount)
  }
  const { id, studentName, studentSurname, dateAdded, mtRef, studentDob, studentGender, studentNationality, englishLevel, roomRequirements, photoPermissions, classRequirements, allergies, notes, arrivalDate, departureDate } = person;

  return (
    <React.Fragment>
    <AddPayment addPayment={addPayment} studentId={person.id}/>
    <div className="detail-card">
      <button className="close-btn" onClick={onClose}>X</button>
      <div className="left-column">
      <img className="br-100 h3 w3 dib" alt={person.id} src={imgPath} />
        <p><strong>DB ref:</strong> {id}</p>
        <p><strong>Name:</strong> {studentName} {studentSurname}</p>
        <p><strong>Added:</strong> {dateAdded}</p>
        <p><strong>Master Tracker Reference:</strong> {mtRef}</p>
        <p><strong>Date of Birth:</strong> {studentDob}</p>
        <p><strong>Gender:</strong> {studentGender}</p>
        <p><strong>Nationality:</strong> {studentNationality}</p>
        <p><strong>English Level:</strong> {englishLevel}</p>
      </div>
      <div className="right-column">
        <p><strong>Room Requirements:</strong> {roomRequirements}</p>
        <p><strong>Photo Permissions:</strong> {photoPermissions}</p>
        <p><strong>Class Requirements:</strong> {classRequirements}</p>
        <p><strong>Allergies:</strong> {allergies}</p>
        <p><strong>Notes:</strong> {notes}</p>
        <p><strong>Arrival Date:</strong> {arrivalDate}</p>
        <p><strong>Departure Date:</strong> {departureDate}</p>
      </div>
    </div>
    </React.Fragment>
  );
}

export default DetailCard;
