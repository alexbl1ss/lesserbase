import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js'
import InvoicePage from './InvoicePage';

function PaymentsCard({ person, onClose, paymentAdded, isAuthenticated }) {
  const [showInvoicePage, setShowInvoicePage] = useState(false);

  const handleLaunchInvoice = () => {
    const invoiceData = {
      studentName: person.studentName,
      studentSurname: person.studentSurname,
      // Add more data as needed
    };
    sessionStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    setShowInvoicePage(true);
  };

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, [person, paymentAdded]);

  const fetchPayments = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/payments/${person.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('payments', JSON.stringify(data));
        setPayments(data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="payments-container">
      {!showInvoicePage && (
        <div className="detail-card payments-card">
          <h2>Payments</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Payment Date</th>
                <th>Payment Amount</th>
                <th>Payment Account</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.paymentdate}</td>
                  <td>{payment.paymentamount}</td>
                  <td>{payment.paymentaccount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invoice-container">
            {/* render the invoice button */}
            <button onClick={handleLaunchInvoice}>Launch Invoice</button>
          </div>
        </div>
      )}

      {/* conditionally render the invoice page */}
      {showInvoicePage && <InvoicePage onClose={setShowInvoicePage} />}

    </div>
  );
}


export default PaymentsCard;
