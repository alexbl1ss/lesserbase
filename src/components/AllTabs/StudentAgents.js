import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../AgentsCard.css';
import AddAgent from '../AddsEdits/AddAgent.js';
import EditAgent from '../AddsEdits/EditAgent.js';

function StudentAgents(props) {
  const { selectedPerson } = props;

  const [agents, setAgents] = useState([]);
//  const [updateAgents, setUpdateAgents] = useState(false); // new state variable

  const fetchAgents = useCallback(() => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/students/${selectedPerson.id}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem('agents', JSON.stringify(data));
        setAgents(data);
      })
      .catch((err) => console.error(err));
  }, [selectedPerson.id]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const addAgent = (agent) => {
    const token = sessionStorage.getItem("bearer"); 

    fetch(`${SERVER_URL}api/students/${selectedPerson.id}/agents`,
      { method: 'POST', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(agent)
    })
    .then(response => {
      if (response.ok) {
        fetchAgents();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }

  const editAgent = (agent, id) => {
    const token = sessionStorage.getItem("bearer"); 

    fetch(`${SERVER_URL}api/agents/${id}`,
      { method: 'PUT', headers: {
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify(agent)
    })
    .then(response => {
      if (response.ok) {
        fetchAgents();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }

   return (
    <React.Fragment>
      <div className="detail-card agent-card" style={{ padding: '20px 0' }}>
        <table style={{ width: '80%', textAlign: 'left', margin: 'auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Agent Type</th>
              <th>Agent Name</th>
              <th>Commission Type</th>
              <th>Commission Rate</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.id}</td>
                <td>{agent.agentType}</td>
                <td>{agent.agentName}</td>
                <td>{agent.commission}</td>
                <td>{agent.commissionRate}</td>   
                <td>
                <EditAgent passedAgent={agent} editAgent={editAgent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddAgent addAgent={addAgent} />
      <div>
        <p style={{ color: '#999999', fontSize: '10px' }}>Student: {selectedPerson.id}</p>
        <p style={{ color: '#999999', fontSize: '10px' }}>Is authenticated: {sessionStorage.getItem('isAuthenticated').toString()}</p>
      </div>
    </React.Fragment>
  );
}

export default StudentAgents;
