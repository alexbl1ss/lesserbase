import React from 'react';

function StudentClassroomCard({person, onClick}) {
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
  
  return(
    <div className="tc my-card dib br3 pa3 ma2 grow bw2 shadow-5" onClick={onClick}>
      <img className="br-100 h3 w3 dib" alt={person.id} src={imgPath} />
      <div>
        <h2>{person.studentName}</h2>
        <p>Level: {person.englishLevel}</p>
        <p>Age: {person.studentAge}</p>
        <p>{person.studentNationality}</p>
      </div>
    </div>
  );
}

export default StudentClassroomCard;
