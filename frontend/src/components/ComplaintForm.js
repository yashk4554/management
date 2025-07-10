
import React, { useState } from 'react';
import api from '../utils/api';
import RichTextEditor from './RichTextEditor';


const ComplaintForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: '', description: '', department: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Draft saving
  React.useEffect(() => {
    const draft = localStorage.getItem('complaintDraft');
    if (draft) setForm(JSON.parse(draft));
  }, []);
  React.useEffect(() => {
    localStorage.setItem('complaintDraft', JSON.stringify(form));
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleDescriptionChange = (desc) => {
    setForm({ ...form, description: desc });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && !form.title) {
      setError('Title is required');
      return;
    }
    if (step === 2 && !form.department) {
      setError('Department is required');
      return;
    }
    setError('');
    setStep(step + 1);
  };
  const handlePrev = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/complaints', form, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('Complaint submitted successfully!');
      setForm({ title: '', description: '', department: '' });
      localStorage.removeItem('complaintDraft');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Submit Complaint</h2>
      {error && <div className="toast-error">{error}</div>}
      {success && <div className="toast-success">{success}</div>}
      <form onSubmit={step === 3 ? handleSubmit : handleNext}>
        {step === 1 && (
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        )}
        {step === 2 && (
          <select name="department" value={form.department} onChange={handleChange} required style={{marginBottom:12, padding: '10px', borderRadius: 6, border: '1px solid #ccc'}}>
            <option value="" disabled>Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
            <option value="OPERATIONS">Operations</option>
            <option value="CUSTOMER SERVICE">Customer Service</option>
            <option value="OTHER">Other</option>
          </select>
        )}
        {step === 3 && (
          <RichTextEditor value={form.description} onChange={handleDescriptionChange} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          {step > 1 && <button onClick={handlePrev} style={{padding:'8px 16px',borderRadius:4,background:'#eee',border:'none',cursor:'pointer'}}>Back</button>}
          {step < 3 && <button type="submit" style={{padding:'8px 16px',borderRadius:4,background:'#1a237e',color:'#fff',border:'none',cursor:'pointer'}}>Next</button>}
          {step === 3 && <button type="submit" style={{padding:'8px 16px',borderRadius:4,background:'#1a237e',color:'#fff',border:'none',cursor:'pointer'}} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>}
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
