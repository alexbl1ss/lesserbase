import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import '../InvoicePage.css';
import { SERVER_URL } from '../../constants.js'

function StudentInvoice(props) {
  const { selectedPerson } = props;
  
  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

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

  const totalActualCharge = bookings && bookings.length ? bookings.reduce((acc, booking) => {
    return acc + booking.actualCharge;
  }, 0) : 0;
  
  const totalAlreadyPaid = payments && payments.length ? payments.reduce((acc, payment) => {
    return acc + payment.paymentamount;
  }, 0) : 0;  
  
  const outstandingBalance = totalActualCharge - totalAlreadyPaid;
  
  let rcpinv;
  let rcpinvalt;
  if(totalAlreadyPaid===0){
    rcpinv = process.env.PUBLIC_URL + "/assets/img/Invoice.png";
    rcpinvalt="Invoice";
  } else {
    rcpinv = process.env.PUBLIC_URL + "/assets/img/receipt.png";
    rcpinvalt="Receipt";
  }

  let footer;
  footer = process.env.PUBLIC_URL + "/assets/img/footer.png";

  const generatePDF = () => {
    const report = new jsPDF('portrait','pt','a4');
     report.html(document.querySelector('#report')).then(() => {
        report.save('report.pdf');
    });
  }

  const generatePDF2 = () => {
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
          pdf.save('report.pdf');
        };
      })
      .catch(function (error) {
        console.error('Error generating PDF', error);
      });
  }
    
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
          <img alt={rcpinvalt} src={rcpinv} style={{ height: '35px', marginTop: '35px' }} />
        </div>
        <hr className="line" style={{ width: '100%' }} />
      </div>
      <div className="student-details-container">
        <div><strong>{selectedPerson.studentName} {selectedPerson.studentSurname}</strong></div>
        <div>Student ID: {selectedPerson.mtRef}</div>
        <div>Check in: {selectedPerson.arrivalDate}</div>
        <div>Check out: {selectedPerson.departureDate}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p>Date: {formattedDate}</p>
        <p>Invoice number: {selectedPerson.mtRef}-01</p>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ textAlign: "center" }}>
          <h2>Booked Items</h2>
        </div>
      </div>
      <div className="bookings-container">
        <table className="bookings-table">
          <tbody>
            {bookings ? (
              bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td>{booking.productName}</td>
                  <td>{booking.startDate}</td>
                  <td>{booking.endDate}</td>
                  <td>£ {booking.actualCharge} GBP</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No bookings found</td>
              </tr>
            )}
            <tr>
              <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
              <td>£ {totalActualCharge} GBP</td>
            </tr>
            {payments ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td colSpan="3" style={{ textAlign: 'right' }}>Payment Received {payment.paymentdate}</td>
                  <td>£ {payment.paymentamount} GBP</td>
                </tr>
              ))
            ) : (
              <tr></tr>
            )}
            <tr>
              <td colSpan="3" style={{ textAlign: 'right' }}><strong>Balance Due:</strong></td>
              <td>£ {outstandingBalance} GBP</td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr className="line" />
      <div className="footer-container">
        <img alt="info@brownleeschools.com" src={footer} style={{ height: '80px', width: '200px', marginTop: '35px'}}/>
      </div>
    </div>
    <button onClick={generatePDF} type="button">Save PDF</button>
    <button onClick={generatePDF2} type="button">Save PDF2</button>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
  </React.Fragment>
</Container>
  );
}

export default StudentInvoice;
