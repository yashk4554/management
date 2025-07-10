
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import AdminComplaintDetail from '../components/AdminComplaintDetail';

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ status: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const [complaintsRes, statsRes, logsRes] = await Promise.all([
        api.get('/admin/complaints', {
          headers: { 'x-auth-token': token },
          params: filters
        }),
        api.get('/admin/stats', { headers: { 'x-auth-token': token } }),
        api.get('/log.txt')
      ]);
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data.split('\n').filter(Boolean).slice(-20).reverse());
    } catch (err) {
      setError('Failed to load admin data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  const handleStatusChange = async (id, status) => {
    setActionMsg('');
    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/admin/complaints/${id}/status`, { status }, { headers: { 'x-auth-token': token } });
      setActionMsg('Status updated!');
      fetchData();
    } catch {
      setActionMsg('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    setActionMsg('');
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/admin/complaints/${id}`, { headers: { 'x-auth-token': token } });
      setActionMsg('Complaint deleted!');
      fetchData();
    } catch {
      setActionMsg('Failed to delete complaint');
    }
  };

  const statusOptions = ['Pending', 'In Progress', 'Resolved'];
  const departments = Array.from(new Set(complaints.map(c => c.department)));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ margin: '18px 0', display: 'flex', gap: 16 }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      {loading && <div className="toast-info">Loading...</div>}
      {error && <div className="toast-error">{error}</div>}
      {actionMsg && <div className="toast-success">{actionMsg}</div>}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f1f1' }}>
              <th>Title</th>
              <th>User</th>
              <th>Department</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.user?.name || 'N/A'}</td>
                <td>{c.department}</td>
                <td>{c.status}</td>
                <td>{new Date(c.date).toLocaleDateString()}</td>
                <td>
                  <select value={c.status} onChange={e => handleStatusChange(c._id, e.target.value)}>
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button style={{ marginLeft: 8 }} onClick={() => window.confirm('Delete complaint?') && handleDelete(c._id)}>Delete</button>
                  <button style={{ marginLeft: 8 }} onClick={() => setSelectedComplaint(c._id)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stats && (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>Status Distribution</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.statusWise.map(s => ({ name: s._id, value: s.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {stats.statusWise.map((entry, idx) => <Cell key={entry._id} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>Complaints by Department</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.departmentWise.map(d => ({ name: d._id, value: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>Top Active Users</h4>
            <ul>
              {stats.topUsers.map((u, idx) => (
                <li key={idx}>{u.user?.name || 'N/A'} ({u.user?.email || 'N/A'}) - {u.count} complaints</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div style={{ background: '#f8f9fa', borderRadius: 6, padding: 16 }}>
        <h4>Recent Activity (log.txt)</h4>
        <div style={{ maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      {selectedComplaint && (
        <AdminComplaintDetail
          complaintId={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdate={() => {
            setSelectedComplaint(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
