import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const AdminComplaintDetail = ({ complaintId, onClose, onStatusUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await api.get(`/admin/complaints/${complaintId}`, {
          headers: { 'x-auth-token': token }
        });
        setComplaint(res.data);
        setStatus(res.data.status);
      } catch (err) {
        setError('Failed to load complaint details');
      }
      setLoading(false);
    };
    if (complaintId) fetchDetail();
  }, [complaintId]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/admin/complaints/${complaintId}/status`, { status, comment }, { headers: { 'x-auth-token': token } });
      if (onStatusUpdate) onStatusUpdate();
      setComment('');
    } catch (err) {
      setError('Failed to update status');
    }
    setUpdating(false);
  };

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
            <div><b>User:</b> {complaint.user?.name || 'N/A'}</div>
            <div><b>Department:</b> {complaint.department}</div>
            <div><b>Status:</b> {complaint.status}</div>
            <div><b>Date:</b> {new Date(complaint.date).toLocaleString()}</div>
            <div><b>Description:</b> <div dangerouslySetInnerHTML={{__html: complaint.description}} /></div>
            {complaint.statusHistory && (
              <div style={{marginTop:16}}>
                <b>Status History:</b>
                <ul>
                  {complaint.statusHistory.map((h, i) => (
                    <li key={i}>{h.status} at {new Date(h.date).toLocaleString()} {h.comment && `- ${h.comment}`}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{marginTop:16}}>
              <b>Update Status:</b>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{marginLeft:8}}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input type="text" placeholder="Comment (optional)" value={comment} onChange={e => setComment(e.target.value)} style={{marginLeft:8}} />
              <button onClick={handleStatusUpdate} disabled={updating} style={{marginLeft:8}}>{updating ? 'Updating...' : 'Update'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
