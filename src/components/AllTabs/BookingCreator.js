import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../BookingCard.css';

function BookingCreator(props) {
  const { selectedPerson, selectedStay, showFinancials } = props;
  const [stayId] = useState(selectedStay ? selectedStay.stayId : '0');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchPath, setSearchPath] = useState('eligableProducts');
  const [selectedDate, setSelectedDate] = useState(
    selectedStay && selectedStay.arrivalDate ? selectedStay.arrivalDate : new Date().toISOString().split('T')[0]
  );
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
        const residentialProducts = [];
        const externalOrAfternoonProducts = [];
        const singleDayExcursion = [];
        const singleDayOther = [];

        data.forEach(product => {
          const startDate = new Date(product.startDate);
          const endDate = new Date(product.endDate);
      
          // Calculate the time difference and convert it to days
          const timeDiff = endDate - startDate;
          const dayDiff = timeDiff / (1000 * 3600 * 24);
      
          // Check if the product lasts exactly one day or starts and ends on the same day
          if (dayDiff === 1 || startDate.toDateString() === endDate.toDateString()) {
              singleDay.push(product);
      
              // Determine which category the single day product belongs to
              if (product.productType === "WEEKEND") {
                  singleDayExcursion.push(product);
              } else {
                  singleDayOther.push(product);
              }
          } else {
              // Handle products with longer durations
              switch (product.productType) {
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
        setSelectedProducts([]);
      })
      .catch((err) => console.error(err));
      setSelectedProducts([]);
  }

  const widenSearch = () => {
    console.log("widened search");
    setSearchPath('eligableProductsWide');
  }
  const normalSearch = () => {
    setSearchPath('eligableProducts');
  }

  const handleNextDay = (event) => {
    event.preventDefault(); // Prevent the default form submission
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
};

const handlePrevDay = (event) => {
    event.preventDefault(); // Prevent the default form submission
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
};    
  return(
    <React.Fragment>
      <div style={{ color: '#999999', fontSize: '10px' }}>
        <p>
          Selected Student: {selectedPerson.id} — 
          Selected Stay: {selectedStay ? `${selectedStay.arrivalDate} to ${selectedStay.departureDate}` : 'None'}
        </p>
      </div>
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
      <h2>Afternoon</h2>
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
      <div className="detail-card booking-card" style={{ padding: '20px 0' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Product Base</th>
              <th>Date</th>
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
      <h2>Single Day Activities</h2>
      <div className="date-selector">
    <label htmlFor="datePicker">Select Date:</label>
    <button onClick={(e) => handlePrevDay(e)}>Prev Day</button>
    <input
      type="date"
      id="datePicker"
      value={selectedDate}
      onChange={e => setSelectedDate(e.target.value)}
    />
    <button onClick={(e) => handleNextDay(e)}>Next Day</button>
</div>


      <div className="detail-card booking-card" style={{ padding: '20px 0', marginTop: '20px' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
            <th>ID</th>
              <th>Product Name</th>
              <th>Product Base</th>
              <th>Date</th>
              <th>Capacity</th>
              <th>Allocated</th>
              {showFinancials && <th>Default Rate</th>}
              <th>book?</th>
            </tr>
          </thead>
          <tbody>
            {singleDayOther.filter(product => 
                new Date(product.startDate).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
                ).length > 0 ? (
                  singleDayOther.filter(product => 
                  new Date(product.startDate).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
                  ).map(eligableProduct => (
                <tr key={eligableProduct.id}>
                  <td>{eligableProduct.id}</td>
                <td>{eligableProduct.name}</td>
                <td>{eligableProduct.base}</td>
                <td>{eligableProduct.startDate}</td>
                <td>{eligableProduct.capacity}</td>
                <td>{eligableProduct.allocated}</td>
                {showFinancials && <td>{eligableProduct.defaultRate}</td>}
                <td>
                    <input
                        type="checkbox"
                        checked={selectedProducts.some(p => p.id === eligableProduct.id)}
                        disabled={eligableProduct.allocated >= eligableProduct.capacity}
                        onChange={() => handleProductSelect(eligableProduct)}
                    />
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No single day products found for date {selectedDate}</td>
              </tr>
            )}
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
