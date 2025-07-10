

import React, { useState, useEffect } from 'react';
import ComplaintForm from './ComplaintForm';
import api from '../utils/api';
import './UserDashboard.css';

function getStatusClass(status) {
  if (!status) return 'complaint-status-badge';
  const s = status.toLowerCase();
  if (s === 'resolved') return 'complaint-status-badge complaint-status-resolved';
  if (s === 'in progress' || s === 'in-progress') return 'complaint-status-badge complaint-status-inprogress';
  if (s === 'rejected') return 'complaint-status-badge complaint-status-rejected';
  return 'complaint-status-badge';
}

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/complaints', {
        headers: { 'x-auth-token': token }
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      setError('Failed to load complaints');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="udash-bg-pro">
      <div className="udash-pro-container" style={{maxWidth: 1100, width: '98%'}}>
        <h2 className="udash-pro-title">User Dashboard</h2>
        <div className="udash-pro-content" style={{background: 'none', boxShadow: 'none', padding: 0}}>
          <div style={{marginBottom: 32}}>
            <ComplaintForm onSuccess={fetchComplaints} />
          </div>
          <h3 style={{marginBottom: 18, color: '#1a237e', fontWeight: 700}}>My Complaints</h3>
          {loading && <div className="toast-info">Loading...</div>}
          {error && <div className="toast-error">{error}</div>}
          <div className="complaint-list-grid">
            {complaints.length === 0 && !loading && <div style={{gridColumn:'1/-1'}}>No complaints found.</div>}
            {complaints.map(c => (
              <div key={c._id} className="complaint-card">
                <div className="complaint-title">{c.title}</div>
                <div className="complaint-meta">
                  <span>Department: {c.department}</span>
                  <span>Status: <span className={getStatusClass(c.status)}>{c.status}</span></span>
                  <span>Date: {new Date(c.date).toLocaleDateString()}</span>
                </div>
                <div className="complaint-desc">{c.description}</div>
                <button
                  className="complaint-view-btn"
                  style={{marginTop: 12}}
                  onClick={() => alert('Details for: ' + c.title)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
