import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../PaymentsCard.css';
import AddPayment from '../AddPayment.js';

function StudentPayments(props) {
  const { selectedPerson } = props;
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

  const addPayment = (payment) => {
    const token = sessionStorage.getItem("bearer"); 

    fetch(`${SERVER_URL}api/payments/${selectedPerson.id}`,
      { method: 'POST', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(payment)
    })
    .then(response => {
      if (response.ok) {
        fetchPayments();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }

  const deletePayment = (event, payment) => {
    event.preventDefault();
  
    const token = sessionStorage.getItem("bearer");
    const id = payment.id;

    console.log(token + " " + id)
    alert("that button doesn't do anything yet")
    
  }

  return(
    <React.Fragment>
        <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
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
                  <td>£ {payment.paymentamount}</td>
                  <td>{payment.paymentaccount}</td>
                  <td>
                    <button onClick={(event) => deletePayment(event, payment)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddPayment studentId={selectedPerson.id} addPayment={addPayment} />
        <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default StudentPayments;
