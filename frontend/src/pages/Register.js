
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';


const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Real-time validation
  const validate = (field, value) => {
    switch (field) {
      case 'name':
        return value.length >= 2 ? '' : 'Name must be at least 2 characters';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Invalid email address';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(validate(name, value));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && !form.name) {
      setError('Name is required');
      return;
    }
    if (step === 2 && !form.email) {
      setError('Email is required');
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
    setLoading(true);
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/auth/register', form);
      setSuccess('Registration successful! Redirecting...');
      login(res.data.token);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: -1,
      background: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80) center/cover no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        marginBottom: 32,
        position: 'relative',
        zIndex: 2
      }}>
        <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" alt="Person using computer" style={{width:'90px',borderRadius:'50%',marginBottom:18,boxShadow:'0 2px 8px rgba(0,0,0,0.10)'}} />
        <h2 style={{marginBottom: 12, color: '#1a237e'}}>Register</h2>
        {error && <div className="toast-error" style={{marginBottom: 14}}>{error}</div>}
        {success && <div className="toast-success" style={{marginBottom: 14}}>{success}</div>}
        <form onSubmit={step === 3 ? handleSubmit : handleNext}>
          {step === 1 && (
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{width:'100%',marginBottom:12,padding:10,borderRadius:4,border:'1px solid #bbb'}} />
          )}
          {step === 2 && (
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{width:'100%',marginBottom:12,padding:10,borderRadius:4,border:'1px solid #bbb'}} />
          )}
          {step === 3 && (
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} style={{width:'100%',marginBottom:18,padding:10,borderRadius:4,border:'1px solid #bbb'}} />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {step > 1 && <button onClick={handlePrev} style={{padding:'8px 16px',borderRadius:4,background:'#eee',border:'none',cursor:'pointer'}}>Back</button>}
            {step < 3 && <button type="submit" style={{padding:'8px 16px',borderRadius:4,background:'#1a237e',color:'#fff',border:'none',cursor:'pointer'}}>Next</button>}
            {step === 3 && <button type="submit" style={{padding:'8px 16px',borderRadius:4,background:'#1a237e',color:'#fff',border:'none',cursor:'pointer'}} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>}
          </div>
        </form>
        <div style={{marginTop:18}}>
          <span style={{fontSize:'0.97rem',color:'#444'}}>Already have an account? <button type="button" onClick={() => navigate('/login')} style={{color:'#1a237e',textDecoration:'underline',background:'none',border:'none',padding:0,cursor:'pointer'}}>Login here</button></span>
        </div>
      </div>
    </div>
  );
};

export default Register;
