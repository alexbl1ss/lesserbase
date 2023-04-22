import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js'
import './AgentsCard.css';


function AgentsCard({ person, onClose }) {
 
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = () => {
    const token = sessionStorage.getItem('bearer');
    fetch(`${SERVER_URL}api/students/${person.id}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setAgents(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="detail-card agent-card">
        <h2>Agents</h2>
     <table>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgentsCard;
