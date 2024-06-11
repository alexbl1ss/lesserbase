import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../BookingCard.css';

function BookingCreator(props) {
  const { selectedPerson, selectedStay, showFinancials } = props;
  const [eligableProducts, setEligableProducts] = useState([]);
  const [stayId] = useState(selectedStay ? selectedStay.stayId : '0');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchPath, setSearchPath] = useState('eligableProducts');
  const [singleDayProducts, setSingleDayProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // defaults to today's date
  const [weekendProducts, setWeekendProducts] = useState([]);
  const [residentialProducts, setResidentialProducts] = useState([]);
  const [externalOrAfternoonProducts, setExternalOrAfternoonProducts] = useState([]);
  const [singleDayExcursion, setSingleDayExcursion] = useState([]);
  const [singleDayOther, setSingleDayOther] = useState([]);
  

  const fetchEligableProducts = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/products/${searchPath}/stay/${stayId}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
        if (response.status === 204) {
            return [];
        } else if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch bookings');
        }
    })
    .then(data => {
        const singleDay = [];
        const weekendProducts = [];
        const residentialProducts = [];
        const externalOrAfternoonProducts = [];
        const singleDayExcursion = [];
        const singleDayOther = [];

        data.forEach(product => {
            if (new Date(product.startDate).toDateString() === new Date(product.endDate).toDateString()) {
                singleDay.push(product);
                if (product.productType === "WEEKEND") {
                    singleDayExcursion.push(product);
                } else {
                    singleDayOther.push(product);
                }
            } else {
                switch (product.productType) {
                    case "WEEKEND":
                        weekendProducts.push(product);
                        break;
                    case "RESIDENTIAL":
                        residentialProducts.push(product);
                        break;
                    case "EXTERNAL":
                    case "AFTERNOON":
                        externalOrAfternoonProducts.push(product);
                        break;
                    default:
                        // Handle any products that don't fit the specified categories if necessary
                        break;
                }
            }
        });

        // Update state with all product lists
        setSingleDayProducts(singleDay);
        setWeekendProducts(weekendProducts);
        setResidentialProducts(residentialProducts);
        setExternalOrAfternoonProducts(externalOrAfternoonProducts);
        setSingleDayExcursion(singleDayExcursion);
        setSingleDayOther(singleDayOther);
    })
    .catch(err => console.error(err));
}, [stayId, searchPath]);



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
      <h2>Residential</h2>
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
              {showFinancials && <th>Default Rate</th>}
              <th>book?</th>
            </tr>
          </thead>
          <tbody>
            {residentialProducts.map((eligableProduct) => (
              <tr key={eligableProduct.id}>
                <td>{eligableProduct.id}</td>
                <td>{eligableProduct.name}</td>
                <td>{eligableProduct.base}</td>
                <td>{eligableProduct.startDate}</td>
                <td>{eligableProduct.endDate}</td>
                <td>{eligableProduct.capacity}</td>
                <td>{eligableProduct.allocated}</td>
                {showFinancials && <td>{eligableProduct.defaultRate}</td>}
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
      <h2>Afternoon</h2>
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
              {showFinancials && <th>Default Rate</th>}
              <th>book?</th>
            </tr>
          </thead>
          <tbody>
            {externalOrAfternoonProducts.map((eligableProduct) => (
              <tr key={eligableProduct.id}>
                <td>{eligableProduct.id}</td>
                <td>{eligableProduct.name}</td>
                <td>{eligableProduct.base}</td>
                <td>{eligableProduct.startDate}</td>
                <td>{eligableProduct.endDate}</td>
                <td>{eligableProduct.capacity}</td>
                <td>{eligableProduct.allocated}</td>
                {showFinancials && <td>{eligableProduct.defaultRate}</td>}
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
      <h2>Weekend</h2>
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
              {showFinancials && <th>Default Rate</th>}
              <th>book?</th>
            </tr>
          </thead>
          <tbody>
            {singleDayExcursion.map((eligableProduct) => (
              <tr key={eligableProduct.id}>
                <td>{eligableProduct.id}</td>
                <td>{eligableProduct.name}</td>
                <td>{eligableProduct.base}</td>
                <td>{eligableProduct.startDate}</td>
                <td>{eligableProduct.endDate}</td>
                <td>{eligableProduct.capacity}</td>
                <td>{eligableProduct.allocated}</td>
                {showFinancials && <td>{eligableProduct.defaultRate}</td>}
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
      <h2>Single Day Activities</h2>
      <div className="date-selector">
        <label htmlFor="datePicker">Select Date:</label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="detail-card booking-card" style={{ padding: '20px 0', marginTop: '20px' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Start Date</th>
              <th>Book?</th>
            </tr>
          </thead>
          <tbody>
            {singleDayOther.filter(product => 
                new Date(product.startDate).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
                ).length > 0 ? (
              singleDayProducts.filter(product => 
                  new Date(product.startDate).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
                  ).map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.startDate}</td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={product.allocated >= product.capacity}
                      onChange={() => handleProductSelect(product)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No single day products found for date {selectedDate}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </React.Fragment>
);
}

export default BookingCreator;
