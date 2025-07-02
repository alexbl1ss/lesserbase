import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../constants.js';
import './MyProfile.css';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('bearer');

    fetch(`${SERVER_URL}api/my-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      })
      .then(data => setProfile(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  const { adult, staff, agent, groupLeader, campGroups, stays } = profile;

  return (
    <section className="profile-container" style={{ textAlign: 'left' }}>
      <h2>My Profile</h2>

      {adult && (
        <div className="profile-section">
          <h3>Personal Details</h3>
          <p><strong>Name:</strong> {adult.adult_name} {adult.adult_surname}</p>
          <p><strong>Email:</strong> {adult.adult_email}</p>
          <p><strong>Phone:</strong> {adult.adult_phone}</p>
          <p><strong>Nationality:</strong> {adult.adult_nationality}</p>
          <p><strong>Allergies:</strong> {adult.allergies || 'None'}</p>
          <p><strong>Notes:</strong> {adult.adult_notes || 'None'}</p>
        </div>
      )}

      {staff && (
        <div className="profile-section">
          <h3>Staff Info</h3>
          <p><strong>Username:</strong> {staff.username}</p>
          <p><strong>First Aid:</strong> {staff.firstaid ? 'Yes' : 'No'}</p>
          <p><strong>DSL:</strong> {staff.dsl ? 'Yes' : 'No'}</p>
          <p><strong>Police Check:</strong> {staff.policecheck ? 'Yes' : 'No'}</p>
          <p><strong>Notes:</strong> {staff.staff_notes}</p>
        </div>
      )}

      {groupLeader && (
        <div className="profile-section">
          <h3>Group Leader</h3>
          <p><strong>Group:</strong> {groupLeader.groupleader_group}</p>
          <p><strong>Notes:</strong> {groupLeader.groupleader_notes}</p>
        </div>
      )}

      {agent && (
        <div className="profile-section">
          <h3>Agent Info</h3>
          <p><strong>Commission:</strong> {agent.commission}%</p>
          <p><strong>Rate:</strong> {agent.commission_rate}</p>
          <p><strong>English Speaking:</strong> {agent.english_speaking ? 'Yes' : 'No'}</p>
          <p><strong>Notes:</strong> {agent.agent_notes}</p>
        </div>
      )}

      {stays && stays.length > 0 && (
        <div className="profile-section">
          <h3>Stays</h3>
          <ul>
            {stays.map((stay, index) => (
              <li key={stay.stayId || index}>
                {stay.residential_base} — {stay.arrivaldate} to {stay.departuredate} {stay.overnight_resident ? '(Overnight)' : ''} — Gender: {stay.stay_gender || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {campGroups && campGroups.length > 0 && (
        <div className="profile-section">
          <h3>Groups Led</h3>
          <ul>
            {campGroups.map(group => (
              <li key={group.campgroupId}>
                {group.group_name} ({group.group_type}) — {group.campus}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="profile-section" style={{ fontStyle: 'italic', fontSize: '0.9em', marginTop: '1rem' }}>
        <p>If any of the information above is incorrect, please speak to your manager to request an update.</p>
      </div>
    </section>
  );
}

export default MyProfile;
