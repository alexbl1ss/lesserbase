import React, { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../constants.js'
import '../AgentsCard.css';

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

  //        <button onClick={handleUpdate}>Update Agents</button> {/* new button */}

//  const handleUpdate = () => {
//    setUpdateAgents(!updateAgents); // toggle updateAgents state variable
//  }

  return (
    <React.Fragment>
      <div className="detail-card agent-card">
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

export default StudentAgents;
