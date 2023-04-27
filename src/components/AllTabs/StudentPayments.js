import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../PaymentsCard.css';

function StudentPayments(props) {
  const { selectedPerson } = props;
  const [payments, setPayments] = useState([]);

  const fetchPayments = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/payments/${selectedPerson.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('payments', JSON.stringify(data));
        setPayments(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return(
    <React.Fragment>
        <div className="detail-card payments-card">
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
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
      <div>
      <p>Student: {selectedPerson.id}</p>
        <p>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default StudentPayments;
