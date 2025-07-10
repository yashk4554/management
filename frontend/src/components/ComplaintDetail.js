import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ComplaintDetail = ({ complaintId, onClose }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/complaints/${complaintId}`, {
          headers: { 'x-auth-token': token }
        });
        setComplaint(res.data);
      } catch (err) {
        setError('Failed to load complaint details');
      }
      setLoading(false);
    };
    if (complaintId) fetchDetail();
  }, [complaintId]);

  if (!complaintId) return null;

  return (
    <div className="complaint-detail-modal">
      <div className="complaint-detail-content">
        <button onClick={onClose} style={{float:'right'}}>Close</button>
        {loading && <div className="toast-info">Loading...</div>}
        {error && <div className="toast-error">{error}</div>}
        {complaint && (
          <>
            <h2>{complaint.title}</h2>
            <div><b>Department:</b> {complaint.department}</div>
            <div><b>Status:</b> {complaint.status}</div>
            <div><b>Date:</b> {new Date(complaint.date).toLocaleString()}</div>
            <div><b>Description:</b> {complaint.description}</div>
            {complaint.statusHistory && (
              <div style={{marginTop:16}}>
                <b>Status History:</b>
                <ul>
                  {complaint.statusHistory.map((h, i) => (
                    <li key={i}>{h.status} at {new Date(h.date).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            )}
            {complaint.updates && complaint.updates.length > 0 && (
              <div style={{marginTop:16}}>
                <b>Updates:</b>
                <ul>
                  {complaint.updates.map((u, i) => (
                    <li key={i}>{u.text} ({new Date(u.date).toLocaleString()})</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Comments section if applicable */}
            {complaint.comments && (
              <div style={{marginTop:16}}>
                <b>Comments:</b>
                <ul>
                  {complaint.comments.map((c, i) => (
                    <li key={i}><b>{c.user}:</b> {c.text} ({new Date(c.date).toLocaleString()})</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;
