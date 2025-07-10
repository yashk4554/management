
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './ComplaintList.css';

function getStatusClass(status) {
  if (!status) return 'complaint-status-badge';
  const s = status.toLowerCase();
  if (s === 'resolved') return 'complaint-status-badge complaint-status-resolved';
  if (s === 'in progress' || s === 'in-progress') return 'complaint-status-badge complaint-status-inprogress';
  if (s === 'rejected') return 'complaint-status-badge complaint-status-rejected';
  return 'complaint-status-badge';
}

const statusOptions = ['All', 'Pending', 'Resolved'];

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('All');
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
    // eslint-disable-next-line
  }, []);

  const filtered = status === 'All' ? complaints : complaints.filter(c => c.status === status);

  return (
    <div className="form-container" style={{ maxWidth: 700 }}>
      <h2>My Complaints</h2>
      <div style={{ marginBottom: 16, width: '100%' }}>
        <label>Status: </label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      </div>
      {loading && <div className="toast-info">Loading...</div>}
      {error && <div className="toast-error">{error}</div>}
      <div className="complaint-list-grid">
        {filtered.length === 0 && !loading && <div style={{gridColumn:'1/-1'}}>No complaints found.</div>}
        {filtered.map(c => (
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
  );
};

export default ComplaintList;
