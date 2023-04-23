import React, { useState, useEffect } from 'react';
import './InvoicePage.css';
import jsPDF from 'jspdf';


  // Get the current date
  const today = new Date();
  
  // Format the date as "DD/MM/YYYY"
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

const studentData = sessionStorage.getItem('student');
const student = studentData ? JSON.parse(studentData) : {};
const bookings = JSON.parse(sessionStorage.getItem('bookings'));
const agents = JSON.parse(sessionStorage.getItem('agents'));
const payments = JSON.parse(sessionStorage.getItem('payments'));


function InvoicePage() {

  const totalActualCharge = bookings.reduce((acc, booking) => {
    return acc + booking.actualCharge;
  }, 0);

  const totalAlreadyPaid = payments.reduce((acc, payment) => {
    return acc + payment.paymentamount;
  }, 0);

  const outstandingBalance = totalActualCharge - totalAlreadyPaid;

  console.log(totalActualCharge)
  console.log(totalAlreadyPaid)
  console.log(outstandingBalance)

  let blissLogoPath;
  blissLogoPath = process.env.PUBLIC_URL + "/assets/img/blissLogo.png";
  let rcpinv;
  let rcpinvalt;
  if(totalAlreadyPaid==0){
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
    const pdfWidth = report.internal.pageSize.getWidth();
    const pdfHeight = report.internal.pageSize.getHeight();

    const options = {
      scale: Math.min(pdfWidth / document.body.offsetWidth, pdfHeight / document.body.offsetHeight)
    };
  
    report.html(document.querySelector('#report'), options).then(() => {
        report.save('report.pdf');
    });
  }
    
  const [showInvoicePage, setShowInvoicePage] = useState(true);
  
  const handleClose = () => {
    setShowInvoicePage(false);
  };
  
  
    useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, []);
  
  return (
    <div>
      <div id="report">
        <div className="images-container">
          <div className="logo-container">
            <img alt="Bliss" src={blissLogoPath} style={{ height: '80px', float: 'left' }} />
            <img alt={rcpinvalt} src={rcpinv} style={{ height: '35px', marginTop: '35px', float: 'right' }} />
          </div>
          <hr className="line" />
          <div className="student-details-container">
            <div><strong>{student.studentName} {student.studentSurname}</strong></div>
            <div>Student ID: {student.mtRef}</div>
            <div>Check in: {student.arrivalDate}</div>
            <div>Check out : {student.departureDate}</div>
          </div>
          <p style={{ textAlign: 'right' }}>
            <div>Date: {formattedDate}</div>  
            <div>Invoice number: 2112</div>
          </p>
          <h2>Booked Items</h2>
          <div className="bookings-container">
            <table className="bookings-table">
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>{booking.productName}</td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td>£ {booking.actualCharge} GBP</td>
                  </tr>
                ))}
                <tr>
                  <td></td>
                  <td></td>
                  <td><strong>Total:</strong></td>
                  <td>£ {totalActualCharge} GBP</td>
                </tr>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td></td>
                    <td>Payment Received</td>
                    <td>{payment.paymentdate}</td>
                    <td>£ {payment.paymentamount} GBP</td>
                  </tr>
                ))}
                <tr>
                  <td></td>
                  <td></td>
                  <td><strong>Balance Due:</strong></td>
                  <td>£ {totalActualCharge} GBP</td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr className="line" />
          <div className="footer-container">
            <img alt="info@brownleeschools.com" src={footer} style={{ height: '80px', width: '200px', marginTop: '35px'}}/>
          </div>
        </div>
      </div>
      <button onClick={generatePDF} type="button">Save PDF</button>
    </div>
  );
  }

export default InvoicePage;
