import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL, CAMPUSES, GROUPTYPES, SCHEDULETYPE, ROLES  } from '../../constants.js';
import AddAdult from '../AddsEdits/AddAdult.js';
import EditAdult from '../AddsEdits/EditAdult.js';
import { Delete } from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import EditAdultStay from '../AddsEdits/EditAdultStay.js';
import AddAdultStay from '../AddsEdits/AddAdultStay.js';

function Adults(props) {
    const [selectedCampus, setSelectedCampus] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedAdultStays, setSelectedAdultStays] = useState([]);
    const [selectedStay, setSelectedStay] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
  

    const [adults, setAdults] = useState([]);

    const fetchAdults = useCallback(() => {
        console.log('Fetching adults...');
        const token = sessionStorage.getItem('bearer');
        fetch(`${SERVER_URL}api/adults`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            setAdults(data);
            sessionStorage.setItem('adults', JSON.stringify(data));
        })
        .catch(err => console.error('Failed to fetch adults', err));
    }, []);

    const fetchCampStays = useCallback(() => {
        if (selectedItem) {
            console.log('Fetching campStays...');
            const token = sessionStorage.getItem('bearer');
            fetch(`${SERVER_URL}api/adult/${selectedItem.id}/stays`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                if (response.ok) {
                    return response.text().then(text => text ? JSON.parse(text) : []);
                } else {
                    throw new Error('Failed to fetch');
                }
            })
            .then(data => {
                setSelectedAdultStays(data);
                sessionStorage.setItem('adultStays', JSON.stringify(data));
            })
            .catch(err => {
                console.error('Failed to fetch adult stays', err);
                setSelectedAdultStays([]); // Ensure we reset the stays list on error
            });
        } else {
            console.log('No selected item, not fetching stays');
            setSelectedAdultStays([]);
        }
    }, [selectedItem]);
    

    useEffect(() => {
        console.log('Component mounted or updated');
        fetchAdults();
    }, [fetchAdults]);

    useEffect(() => {
        fetchCampStays();
    },[selectedItem, fetchCampStays]);

    useEffect(() => {
        filterItems(selectedRole);
    }, [adults, selectedRole]);

    const filterItems = (type) => {
        let filtered = adults.filter(adult => (!type || adult.role === type));
    
        setFilteredItems(filtered); 
    
        if (filtered.length > 0) {
            const firstItem = filtered[0];
            setSelectedItem(firstItem);
        } else {
            setSelectedItem(null);
        }
    };

    const handleRoleChange = (event) => {
        const role = event.target.value;
        setSelectedRole(role);
        filterItems(role);
    };

    const handleSelectItem = (adult) => {
        setSelectedItem(prevSelectedItem => (prevSelectedItem && prevSelectedItem.id === adult.id ? null : adult));
    };

    const handleSelectStay = (stay) => {
        setSelectedStay(prevSelectedStay => (prevSelectedStay && prevSelectedStay.stayId === stay.stayId ? null : stay));
    }; 
    
    const addAdult = adult => {
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/adults`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(adult)
        })
        .then(response => response.ok ? fetchAdults() : alert('Something went wrong!'))
        .catch(err => console.error('Error posting adult', err));
    };

    const editAdult = updatedAdult => {
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/adults/${updatedAdult.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAdult)
        })
        .then(response => response.ok ? fetchAdults() : alert('Something went wrong!'))
        .catch(err => console.error('Error updating adult', err));
    };

    const handleEditClick = (stay) => {
        setSelectedStay(stay);
        setEditOpen(true);
      };
  

    const addStay = (stay) => {
        const token = sessionStorage.getItem("bearer");

        fetch(`${SERVER_URL}api/adult/${selectedItem.id}/stays`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(stay)
        })
            .then(response => {
                if (response.ok) {
                    fetchCampStays();
                } else {
                    alert('Something went wrong!');
                }
            })
            .catch(err => console.error(err))
    }
    
    const updateAdultStay = updatedAdultStay => {
        const token = sessionStorage.getItem("bearer");
        fetch(`${SERVER_URL}api/adult/${selectedItem.id}/stay/${selectedStay.stayId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAdultStay)
        })
        .then(response => response.ok ? fetchCampStays() : alert('Something went wrong!'))
        .catch(err => console.error('Error updating adult stay', err));
    };

    const deleteAdult = (event, adultId) => {
        event.preventDefault();
      
        const token = sessionStorage.getItem("bearer");
        
        fetch(`${SERVER_URL}api/adult/${adultId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })
          .then(response => response.json())
          .then(data => {
            const adultId = data.id;
            
            return fetch(`${SERVER_URL}api/adult/delete/${adultId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              method: 'DELETE'
            })
          })
          .then(response => {
    
            if (response.ok) {
              fetchAdults();
            }
            else {
              alert('Something went wrong!');
            }
          })
          .catch(err => console.error(err))
      }

    const deleteAdultStay = (event, stayId) => {
        event.preventDefault();
      
        const token = sessionStorage.getItem("bearer");
        
        fetch(`${SERVER_URL}api/adult/${selectedItem.id}/stays`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })
          .then(response => response.json())
          .then(data => {
            const adultId = data.id;
            
            return fetch(`${SERVER_URL}api/adult/${selectedItem.id}/stay/${stayId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              method: 'DELETE'
            })
          })
          .then(response => {
    
            if (response.ok) {
              fetchCampStays();
            }
            else {
              alert('Something went wrong!');
            }
          })
          .catch(err => console.error(err))
      }

    return (
        <React.Fragment>
            <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
            <FormControl variant="standard" style={{ minWidth: 240, marginBottom: '20px' }}>
                <InputLabel id="type-label">Role</InputLabel>
                <Select
                    labelId="type-label"
                    id="type-select"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    >
                    {ROLES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                    {type.label}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <table style={{ width: '80%', textAlign: 'left', margin: '20px auto', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Gender</th>
                        <th>Allergies</th>
                        <th>Role</th>
                        <th>Notes</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(adult => (
                        <tr key={adult.id}>
                            <td>{adult.id}</td>
                            <td>{adult.adultName}</td>
                            <td>{adult.adultSurname}</td>
                            <td>{adult.adultGender}</td>
                            <td>{adult.allergies}</td>
                            <td>{adult.role}</td>
                            <td>{adult.notes}</td>
                            <td>
                                <EditAdult adultToEdit={adult} updateAdult={editAdult}/>
                            </td>
                            <td>
                                <IconButton onClick={(event) => deleteAdult(event, adult.id)}><Delete color="primary"/></IconButton>
                            </td>
                            <td>
                            <input
                                type="checkbox"
                                checked={selectedItem && selectedItem.id === adult.id}
                                onChange={() => handleSelectItem(adult)}
                            />
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <AddAdult addAdult={addAdult} />
            <div className="detail-card payments-card" style={{ padding: '20px 0' }}>
            <table style={{ width: '80%', textAlign: 'left', margin: '20px auto', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Campus</th>
                        <th>Start</th>
                        <th>Finish</th>
                        <th>Residential</th>
                    </tr>
                </thead>
                <tbody>
                {selectedAdultStays.map(stay => (
                            <tr key={stay.stayId}>
                                <td>{stay.stayId}</td>
                                <td>{stay.campus}</td>
                                <td>{stay.arrivalDate}</td>
                                <td>{stay.departureDate}</td>
                                <td>{stay.residential}</td>
                                <td>
                                    <IconButton onClick={() => handleEditClick(stay)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                </td>
                                <td>
                                    <IconButton onClick={(event) => deleteAdultStay(event, stay.stayId)}><Delete color="primary" /></IconButton>
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedStay && selectedStay.stayId === stay.stayId}
                                        onChange={() => handleSelectStay(stay)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EditAdultStay
                adultId={selectedItem}
                adultStayToEdit={selectedStay}
                updateAdultStay={updateAdultStay}
                open={editOpen}
                onClose={() => setEditOpen(false)}
                editStay={(stay) => EditAdultStay(selectedStay, updateAdultStay, selectedItem.id, selectedStay.stayId)}
            />
            <AddAdultStay
                adultId={selectedItem}
                addStay={addStay}
            />
            <div>
                <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
            </div>    
        </React.Fragment>
    );
}

export default Adults;
