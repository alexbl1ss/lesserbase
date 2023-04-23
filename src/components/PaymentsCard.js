import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js'

function PaymentsCard({ person, onClose, paymentAdded, isAuthenticated }) { // <-- add paymentAdded as a prop
  console.log("payments card isauthenticated")
  console.log(isAuthenticated)

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
      .then((data) => setPayments(data))
      .catch((err) => console.error(err));
  };

  return (
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
    </div>
  );
}

export default PaymentsCard;
