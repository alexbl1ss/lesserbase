import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import '../InvoicePage.css';
import { SERVER_URL } from '../../constants.js'

function StudentSummary(props) {
  const { selectedPerson, selectedStay } = props;
  const [student, setStudent] = useState([]);

  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
 const [invoiceDate, setInvoiceDate] = useState(formattedDate);
 
  const handleInvoiceDateChange = (event) => {
    setInvoiceDate(event.target.value);
  };

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


 
  const [agents, setAgents] = useState([]);
  const fetchAgents = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/students/${selectedPerson.id}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('agents', JSON.stringify(data));
        setAgents(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const [bookings, setBookings] = useState([]);
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
        sessionStorage.setItem('bookings', JSON.stringify(data));
        setBookings(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);
 
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
    const sortedBookings = bookings.sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });

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
        sessionStorage.setItem('stays', JSON.stringify(data));
        setStays(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);
 
  useEffect(() => {
    fetchStays();
  }, [fetchStays]);
    const sortedStays = stays.sort((a, b) => {
    return new Date(a.arrivalDate) - new Date(b.arrivalDate);
  });
  
  const [payments, setPayments] = useState([]);
  const fetchPayments = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/payments/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 204) { 
          return [];
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch payments');
        }
      })
      .then((data) => {
        sessionStorage.setItem('payments', JSON.stringify(data));
        setPayments(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  let blissLogoPath;
  blissLogoPath = process.env.PUBLIC_URL + "/assets/img/blissLogo.png";

  const totalCommission = agents && agents.length ? agents.reduce((acc, agent) => {
    return acc + agent.commissionRate;
  }, 0) : 0;
  const factor = (100 - totalCommission) / 100;


  const totalGrossCharge = bookings && bookings.length ? bookings.reduce((acc, booking) => {
    return acc + booking.actualCharge;
  }, 0) : 0;
  
  const totalNetCharge = bookings && bookings.length ? bookings.reduce((acc, booking) => {
    if (booking.commissionable) 
    {
      return acc + booking.actualCharge * factor;
    } else {
      return acc + booking.actualCharge;
    }
  }, 0) : 0;
  
  const totalAlreadyPaid = payments && payments.length ? payments.reduce((acc, payment) => {
    return acc + payment.paymentamount;
  }, 0) : 0;  
  
  const outstandingBalanceGross = totalGrossCharge - totalAlreadyPaid;
  const outstandingBalanceNet = totalNetCharge - totalAlreadyPaid;
  const [gross, setGross] = useState(true);

  let summary;
  let summaryalt;
  summary = process.env.PUBLIC_URL + "/assets/img/summary.png";
  summaryalt="Summary";
  
  let footer;
  footer = process.env.PUBLIC_URL + "/assets/img/footer.png";

  const generatePDF2 = (invoiceDate, studentId) => {
    // Get the report element
    const report = document.getElementById('report');
  
    // Convert the report to an image
    toPng(report)
      .then(function (dataUrl) {
        // Create a new PDF document
        const pdf = new jsPDF();
  
        // Set the width of the image to 80% of the PDF page width
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imageWidth = 0.8 * pageWidth;
  
        // Calculate the height of the image based on the aspect ratio of the original image
        const img = new Image();
        img.src = dataUrl;
        img.onload = function () {
          const imageHeight = (img.height * imageWidth) / img.width;
  
          // Split the image across multiple pages if necessary
          let yOffset = 0;
          while (yOffset < imageHeight) {
            // Calculate the height of the image on this page
            const pageHeight = pdf.internal.pageSize.getHeight();
            const remainingHeight = imageHeight - yOffset;
            const heightOnPage = Math.min(remainingHeight, pageHeight);
  
            // Center the image horizontally on the PDF page
            const x = (pageWidth - imageWidth) / 2;
  
            // Add the image to the PDF
            pdf.addImage(dataUrl, 'PNG', x, yOffset, imageWidth, heightOnPage);
  
            // Add a new page if necessary
            yOffset += heightOnPage;
            if (yOffset < imageHeight) {
              pdf.addPage();
            }
          }
  
          // Save the PDF
          pdf.save(`Summary_${studentId}_${invoiceDate}.pdf`);
        };
      })
      .catch(function (error) {
        console.error('Error generating PDF', error);
      });
  }

  const calculateAgeAtCamp = (dob, arrivalDate) => {
    const birthDate = new Date(dob);
    const arrival = new Date(arrivalDate);
    let age = arrival.getFullYear() - birthDate.getFullYear();
    const m = arrival.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && arrival.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
    
return (
<Container
  fixed
  style={{
    backgroundColor: 'white',
    maxWidth: '17cm',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
  }}
>
  <React.Fragment>
    <div id="report">
     <div className="images-container">
        <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <img alt="Bliss" src={blissLogoPath} style={{ height: '80px' }} />
          <img alt={summaryalt} src={summary} style={{ height: '35px', marginTop: '35px' }} />
        </div>
        <hr className="line" style={{ width: '100%' }} />
      </div>
      <div className="student-details-container">
        <div><strong>{student.studentName} {student.studentSurname}</strong></div>
        <div>Student ID: {student.id}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p>Date: {invoiceDate}</p>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ textAlign: "center" }}>
          <h2>Booking Summary</h2>
        </div>
      </div>
      <div className="bookings-container">
      <table className="bookings-table">
  <tbody>
    <tr><td colspan="2" style={{fontWeight: 'bold'}}>First Name:</td><td>{student.studentName}</td><td style={{fontWeight: 'bold'}}>Surname:</td><td>{student.studentSurname}</td>
    <td colspan="2" style={{fontWeight: 'bold'}}>Nationality:</td><td>{student.studentNationality}</td></tr>
    <tr><td colspan="2" style={{fontWeight: 'bold'}}>English Level:</td><td>{student.englishLevel}</td>
    <td colspan="2" style={{fontWeight: 'bold'}}>Age at camp:</td><td>{sortedStays && sortedStays.length > 0 ? calculateAgeAtCamp(student.studentDob, sortedStays[0].arrivalDate) : 'N/A'}</td>
    <td style={{fontWeight: 'bold'}}>Gender:</td><td>{student.studentGender}</td></tr>
    <tr><td colSpan ="8" style={{fontWeight: 'bold', textAlign: 'center' }}>Locations</td></tr>
    <tr style={{fontWeight: 'bold'}}><td colSpan="2">Campus</td><td>Arrival</td><td>Departure</td><td colspan="4"></td></tr>
    {sortedStays && sortedStays.length > 0 ? (
      sortedStays.map((stay) => (
        <tr key={stay.stayId}>
          <td colSpan="2">{stay.campus}</td>
          <td>{stay.arrivalDate}</td>
          <td>{stay.departureDate}</td>
          <td colspan="4"></td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="8">No Stays found</td>
      </tr>
    )}
    <tr><td colSpan ="8" style={{fontWeight: 'bold', textAlign: 'center' }}>Bookings</td></tr>
    <tr style={{fontWeight: 'bold'}}><td colSpan="4">Activity</td><td colspan="2">Start</td><td colspan="2">Finish</td></tr>
    {sortedBookings && sortedBookings.length > 0 ? (
      sortedBookings.map((booking) => (
        <tr key={booking.bookingId}>
          <td colSpan="4">{booking.productName}</td>
          <td colSpan="2">{booking.startDate}</td>
          <td colSpan="2">{booking.endDate}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="8">No bookings found</td>
      </tr>
    )}
    <tr><td colSpan ="8"></td></tr>
    <tr><td colSpan="2" style={{fontWeight: 'bold'}}>Class Requirements:</td><td colSpan="6">{student.classRequirements}</td></tr>
    <tr><td colSpan="2" style={{fontWeight: 'bold'}}>Room Requirements:</td><td colSpan="6">{student.roomRequirements}</td></tr>
    <tr><td colSpan="2" style={{fontWeight: 'bold'}}>Allergies:</td><td colSpan="6">{student.allergies}</td></tr>
    <tr><td colSpan="2" style={{fontWeight: 'bold'}}>Notes:</td><td colSpan="6">{student.notes}</td></tr>
    <tr><td colSpan ="8"></td></tr>
    <tr><td style={{fontWeight: 'bold'}}>Pool</td><td>{student.hasPoolPermission ? 'Yes' : 'No'}</td>
    <td style={{fontWeight: 'bold'}}>Photo</td><td>{student.hasPhotoPermission ? 'Yes' : 'No'}</td>
    <td style={{fontWeight: 'bold'}}>Medical</td><td>{student.hasMedicalPermission ? 'Yes' : 'No'}</td>
    <td style={{fontWeight: 'bold'}}>Hospital</td><td>{student.hasHospitalPermission ? 'Yes' : 'No'}</td></tr>
    <tr><td style={{fontWeight: 'bold'}}>Excursion</td><td>{student.hasExcursionPermission ? 'Yes' : 'No'}</td>
    <td style={{fontWeight: 'bold'}}>Activity</td><td>{student.hasActivityPermission ? 'Yes' : 'No'}</td>
    <td style={{fontWeight: 'bold'}}>Supervision</td><td>{student.hasSupervisionPermission ? 'Yes' : 'No'}</td><td colSpan="2"></td></tr>
  </tbody>
</table>

      </div>
      <hr className="line" />
      <div className="footer-container">
        <img alt="info@brownleeschools.com" src={footer} style={{ height: '80px', width: '200px', marginTop: '35px'}}/>
      </div>
    </div>
    <p>Date: <input type="text" value={invoiceDate} onChange={handleInvoiceDateChange} /></p>
    <button onClick={() => generatePDF2(invoiceDate, student.id)} type="button">Save PDF</button>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
  </React.Fragment>
</Container>
  );
}

export default StudentSummary;
