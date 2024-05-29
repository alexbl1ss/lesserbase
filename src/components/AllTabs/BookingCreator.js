import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../BookingCard.css';

function BookingCreator(props) {
  const { selectedPerson, selectedStay } = props;
  const [eligableProducts, setEligableProducts] = useState([]);
  const [stayId, setStayId] = useState(selectedStay ? selectedStay.stayId : '0');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchPath, setSearchPath] = useState('eligableProducts');

  //console.log("Received selectedStay in BookingCreator:", selectedStay);
  //console.log(stayId);

  const fetchEligableProducts = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/products/${searchPath}/stay/${stayId}`, {
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
        setEligableProducts(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id, stayId, searchPath]);

  useEffect(() => {
    fetchEligableProducts();
  }, [fetchEligableProducts]);

  const sortedProducts = eligableProducts.sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });
  
  
   const handleProductSelect = useCallback((product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
}, [selectedProducts]);

const handleBookings = () => {
    const token = sessionStorage.getItem('bearer');
  
    Promise.all(selectedProducts.map((product) => {
      const requestBody = {
        actualCharge: product.defaultRate,
        bookingStatus: 'PROVISIONAL'
      };
  
      return fetch(`${SERVER_URL}api/bookings/studentId/${selectedPerson.id}/productId/${product.id}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to create booking');
          }
        });
    }))
      .then(() => {
        fetchEligableProducts();
      })
      .catch((err) => console.error(err));
  }

  const widenSearch = () => {
    console.log("widen search");
    setSearchPath('eligableProductsWide');
  }
  const normalSearch = () => {
    setSearchPath('eligableProducts');
  }
    
  return(
    <React.Fragment>
    <button onClick={widenSearch} type="button">Wide Search</button>
    <button onClick={normalSearch} type="button">Normal Search</button>
    <button onClick={handleBookings} type="button">Book</button>
    <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
      <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Product Base</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Capacity</th>
            <th>Allocated</th>
            <th>Default Rate</th>
            <th>book?</th>
          </tr>
        </thead>
        <tbody>
        {sortedProducts.map((eligableProduct) => (
          <tr key={eligableProduct.id}>
          <td>{eligableProduct.id}</td>
          <td>{eligableProduct.name}</td>
          <td>{eligableProduct.base}</td>
          <td>{eligableProduct.startDate}</td>
          <td>{eligableProduct.endDate}</td>
          <td>{eligableProduct.capacity}</td>
          <td>{eligableProduct.allocated}</td>
          <td>{eligableProduct.defaultRate}</td>
          <td>
          <input
            type="checkbox"
            disabled={eligableProduct.allocated >= eligableProduct.capacity}
            onChange={() => handleProductSelect(eligableProduct)}
          />
        </td>
      </tr>
    ))}
        </tbody>
      </table>
    </div>
    <button onClick={handleBookings}  type="button">Create Bookings</button>
    <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Selected Stay: {selectedStay ? selectedStay.stayId : 'None'}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
);
}

export default BookingCreator;
