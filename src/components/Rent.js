import React, { useState } from 'react';
import { SERVER_URL } from '../constants.js';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


  function Rent() {
    const [residentCount, setResidentCount] = useState([]);
    const [rentTableCollapsed, setRentTableCollapsed] = useState(false);
    const [commissionTableCollapsed, setCommissionTableCollapsed] = useState(false);
    const [commissions, setCommissions] = useState([]);
  
  const fetchCommission = () => {
    console.log("fetchCommission");
    const token = sessionStorage.getItem('bearer');
    
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_URL}api/commission`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.status === 204) {
            resolve({ data: [], status: response.status }); // Resolve with an object containing data and status
          } else if (response.ok) {
            return response.json()
              .then((data) => resolve({ data, status: response.status })); // Resolve with an object containing data and status
          } else {
            throw new Error('Failed to fetch commissions');
          }
        })
        .catch((err) => {
          reject(err); // Reject with the error
        });
    });
  };

  const getResidentCountsForDates = async (startDate, endDate) => {
    try {
      const dates = getDatesBetween(startDate, endDate);
      const token = sessionStorage.getItem('bearer');
      const responses = await Promise.all(
        dates.map((date) =>
          fetch(`${SERVER_URL}api/residentcount/${date}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const residentCounts = await Promise.all(
        responses.map(async (response) => {
          if (response.status === 204) {
            return [];
          } else if (response.ok) {
            const json = await response.json();
            return json;
          } else {
            throw new Error('Failed to fetch resident count');
          }
        })
      );

      sessionStorage.setItem('students', JSON.stringify(residentCounts));
      setResidentCount(residentCounts.flat());
    } catch (error) {
      console.error(error);
    }
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const handleGetRentData = () => {
    fetchRentData()
      .catch((error) => {
        console.error(error);
      });
  };
  
  const handleGetCommissionData = () => {
    fetchCommissionData()
      .then((response) => {
        if (response && response.data && response.status) {
          const { data, status } = response;
          if (status === 204) {
            setCommissions([]);
          } else {
            setCommissions(data);
            calculateRunningTotals(data);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
      
  const calculateRunningTotals = (commissions) => {
    let netTotal = 0;
    let grossTotal = 0;
  
    const updatedCommissions = commissions.map((item) => {
      if (item.commission === 'NET') {
        netTotal += item.actualCharge * (item.commissionRate / 100);
        item.runningTotal = netTotal;
      } else if (item.commission === 'GROSS') {
        grossTotal += item.actualCharge * (item.commissionRate / 100);
        item.runningTotal = grossTotal;
      }
      return item;
    });
  
    setCommissions(updatedCommissions); // Update commissions state with running totals
  };
    const fetchRentData = () => {
    return getResidentCountsForDates('2023-06-08', '2023-08-08');
  };
  
  const fetchCommissionData = () => {
    setCommissions([]); // Clear the commissions state
    return fetchCommission()
      .then((response) => {
        const { data, status } = response;
        if (status === 204) {
          setCommissions([]);
        } else {
          setCommissions(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  const calculateTotalCost = () => {
    let totals = {
      Kilgraston: 0,
      Strathallan: 0,
      Glenalmond: 0,
      Overall: 0
    };
      residentCount.forEach((item) => {
      if (item.campus.toLowerCase() === 'kilgraston' && item.residentType.toLowerCase() === 'student') {
        totals.Kilgraston += item.residentCount * 35;
        totals.Overall += item.residentCount * 35;
      } else if (item.campus.toLowerCase() === 'kilgraston' && item.residentType.toLowerCase() === 'staff') {
        totals.Kilgraston += item.residentCount * 30;
        totals.Overall += item.residentCount * 30;
      } else if (item.campus.toLowerCase() === 'kilgraston' && item.residentType.toLowerCase() === 'adult') {
        totals.Kilgraston += item.residentCount * 0;
        totals.Overall += item.residentCount * 30;
      } else if (item.campus.toLowerCase() === 'strathallan') {
        totals.Strathallan += item.residentCount * 45;
        totals.Overall += item.residentCount * 45;
      } else if (item.campus.toLowerCase() === 'glenalmond') {
        totals.Glenalmond += item.residentCount * 45;
        totals.Overall += item.residentCount * 45;
       }
    });
    return totals;
  };

  const calculateTotalNet = () => {
    let total = 0;
    commissions.forEach((item) => {
      if (item.commission === 'NET') {
        total += item.actualCharge * item.commissionRate / 100;
      }
    });
    return total.toFixed(2);
  };
  
  const calculateTotalGross = () => {
    let total = 0;
    commissions.forEach((item) => {
      if (item.commission === 'GROSS') {
        total += item.actualCharge * item.commissionRate / 100;
      }
    });
    return total.toFixed(2);
  };
      
  const handleExportCSVRent = (dataToExport, headerRow, fileName) => {
    // Convert data to CSV format
    const csvData = dataToExport.map(
      ({ givenDate, campus, residentType, residentCount }) =>
        `${givenDate},${campus},${residentType},${residentCount},${calculateCost(campus, residentType, residentCount)}`
    );
    
    // Calculate the total cost
    const totalCost = dataToExport.reduce(
      (total, { campus, residentType, residentCount }) =>
        total + calculateCost(campus, residentType, residentCount),
      0
    );
  
    // Add total row to CSV data
    const totalRow = `,Total,,,${totalCost}`;
    csvData.push(totalRow);
  
    const csvContent = 'data:text/csv;charset=utf-8,' + headerRow + '\n' + csvData.join('\n');
  
    // Trigger download of CSV file
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  };
  
  const handleExportCSVCommission = (dataToExport, headerRow, fileName) => {
        // Convert data to CSV format
        const csvData = dataToExport.map(
          ({
            agentId,
            agentName,
            commission,
            commissionRate,
            studentId,
            mtRef,
            bookingId,
            actualCharge,
            productName,
          }) =>
            `${agentId},${agentName},${commission},${commissionRate},${studentId},${mtRef},${bookingId},${actualCharge},${productName},${
              commission === 'NET' ? actualCharge * (commissionRate / 100) : ''
            },${commission === 'GROSS' ? actualCharge * (commissionRate / 100) : ''}`
        );
      
        // Add headers row to CSV data
        csvData.unshift(headerRow);
      
        const csvContent = 'data:text/csv;charset=utf-8,' + csvData.join('\n');
      
        // Trigger download of CSV file
        const encodedURI = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedURI);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
      };
        
// Calculate the cost based on campus, resident type, and count
const calculateCost = (campus, residentType, residentCount) => {
    let cost = 0;
    if (campus.toLowerCase() === 'kilgraston' && residentType.toLowerCase() === 'student') {
      cost = residentCount * 35;
    } else if (campus.toLowerCase() === 'kilgraston' && residentType.toLowerCase() === 'staff') {
      cost = residentCount * 30;
    } else if (campus.toLowerCase() === 'kilgraston' && residentType.toLowerCase() === 'adult') {
      cost = residentCount * 0;
    } else if (campus.toLowerCase() === 'strathallan') {
        cost = residentCount * 45;
    } else if (campus.toLowerCase() === 'glenalmond') {
        cost = residentCount * 45;
    }
    return cost;
  };
  
  return (
    <section className="garamond">
      <div className="pa2">
        <button onClick={handleGetRentData}>Get Rent Data</button>
        <button onClick={handleGetCommissionData}>Get Commission Data</button>
  
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ marginRight: '10px' }}>Rent</h2>
          </div>
          <table style={{ width: '30%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td>Total (Kilgraston):</td>
                <td>£ {calculateTotalCost().Kilgraston}</td>
              </tr>
              <tr>
                <td>Total (Strathallan):</td>
                <td>£ {calculateTotalCost().Strathallan}</td>
              </tr>
              <tr>
                <td>Total (Glenalmond):</td>
                <td>£ {calculateTotalCost().Glenalmond}</td>
              </tr>
              <tr>
                <td>Total (Overall):</td>
                <td>£ {calculateTotalCost().Overall}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span>Detail</span>
            <IconButton
              onClick={() => setRentTableCollapsed(!rentTableCollapsed)}
              aria-expanded={rentTableCollapsed}
              aria-label="show more"
            >
              {rentTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </div>
          <Collapse in={rentTableCollapsed}>
            <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Campus</th>
                  <th>Resident Type</th>
                  <th>Resident Count</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {residentCount.map((item, index) => (
                  <tr key={index}>
                    <td>{item.givenDate}</td>
                    <td>{item.campus}</td>
                    <td>{item.residentType}</td>
                    <td>{item.residentCount}</td>
                    <td>
                    {(item.campus.toLowerCase() === 'kilgraston' && item.residentType === 'student') ? (
                      '£ ' + item.residentCount * 35
                    ) : (item.campus.toLowerCase() === 'kilgraston' && item.residentType === 'staff') ? (
                        '£ ' + item.residentCount * 30
                    ) : (item.campus.toLowerCase() === 'kilgraston' && item.residentType === 'adult') ? (
                     '£ ' + item.residentCount * 0
                    ) : item.campus === 'Strathallan'  ? (
                        '£ ' + item.residentCount * 45
                      ) : item.campus === 'Glenalmond'  ? (
                        '£ ' + item.residentCount * 45
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>Total:</td>
                  <td>£ {calculateTotalCost().Overall}</td>
                </tr>
              </tfoot>
            </table>
            <button
              onClick={() =>
                handleExportCSVRent(
                  residentCount,
                  'Date, Campus, Resident Type, Resident Count, Cost',
                  'rent.csv'
                )
              }
              type="button"
            >
              Export CSV
            </button>
          </Collapse>
        </div>
  
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ marginRight: '10px' }}>Commission</h2>
          </div>
          <table style={{ width: '30%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td>Total (Net):</td>
                <td>£ {calculateTotalNet()}</td>
              </tr>
              <tr>
                <td>Total (Gross):</td>
                <td>£ {calculateTotalGross()}</td>
              </tr>
              <tr>
              <td>Total (Overall):</td>
                <td>£ {Number(calculateTotalGross()) + Number(calculateTotalNet())}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span>Detail</span>
            <IconButton
              onClick={() => setCommissionTableCollapsed(!commissionTableCollapsed)}
              aria-expanded={commissionTableCollapsed}
              aria-label="show more"
            >
              {commissionTableCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </div>
          <Collapse in={commissionTableCollapsed}>
            <table style={{ width: '80%', textAlign: 'left', margin: '50px auto', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Agent Id</th>
                  <th>Name</th>
                  <th>Commission Type</th>
                  <th>Rate</th>
                  <th>Student Id</th>
                  <th>Master Tracker Ref</th>
                  <th>Booking Id</th>
                  <th>Charge</th>
                  <th>Product Name</th>
                  <th>NET</th>
                  <th>GROSS</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.agentId}</td>
                    <td>{item.agentName}</td>
                    <td>{item.commission}</td>
                    <td>{item.commissionRate}</td>
                    <td>{item.studentId}</td>
                    <td>{item.mtRef}</td>
                    <td>{item.bookingId}</td>
                    <td>{item.actualCharge}</td>
                    <td>{item.productName}</td>
                    <td>
                      {item.commission === 'NET' ? (
                        '£ ' + item.actualCharge * item.commissionRate / 100
                      ) : null}
                    </td>
                    <td>
                      {item.commission === 'GROSS' ? (
                        '£ ' + item.actualCharge * item.commissionRate / 100
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>Totals:</td>
                  <td>£ {calculateTotalNet()}</td>
                  <td>£ {calculateTotalGross()}</td>
                </tr>
              </tfoot>
            </table>
            <button
              onClick={() =>
                handleExportCSVCommission(
                  commissions,
                  'Agent Id,Name,Commission Type,Rate,Student Id,Master Tracker Ref,Booking Id,Charge,Product Name,NET,GROSS',
                  'commission.csv'
                )
              }
              type="button"
            >
              Export CSV
            </button>
          </Collapse>
        </div>
  
        <div>
          <p style={{ color: '#999999', fontSize: '10px' }}>
            Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}
          </p>
        </div>
      </div>
    </section>
  );
  
   
}

export default Rent;