import { useEffect } from 'react';

function InvoicePage() {
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, []);
  
  const invoiceData = JSON.parse(sessionStorage.getItem('invoiceData'));
  
  return (
    <div>
      <h1>Invoice Page</h1>
      <p>Name: {invoiceData.studentName} {invoiceData.studentSurname}</p>
      {/* Render other invoice data as needed */}
    </div>
  );
}

export default InvoicePage;
