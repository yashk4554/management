import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: -1,
      background: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80) center center / cover no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 22,
        boxShadow: '0 8px 48px rgba(0,0,0,0.16)',
        maxWidth: 950,
        width: '90%',
        minWidth: 340,
        minHeight: 480,
        height: '60vh',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}>
        {/* Left Section: Welcome */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(120deg, #e3f0ff 0%, #f9f9f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 18px',
          borderRight: '1.5px solid #e0e7ef',
        }}>
          <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: '2.3rem', marginBottom: 18, textAlign: 'center', letterSpacing: '1px', lineHeight: 1.2 }}>Welcome to the<br/>Complaint Management Portal</h1>
          <p style={{ color: '#444', fontSize: '1.25rem', textAlign: 'center', marginTop: 8, fontWeight: 500, lineHeight: 1.5 }}>Your one-stop solution for submitting and tracking complaints efficiently.</p>
        </div>
        {/* Right Section: Login Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 18px',
        }}>
          <h2 style={{marginBottom: 22, color: '#1a237e', fontWeight: 700, fontSize: '2rem', letterSpacing: '0.5px'}}>Login</h2>
          {error && <div className="toast-error" style={{marginBottom: 14, fontSize: '1.08rem'}}>{error}</div>}
          <form onSubmit={handleSubmit} style={{width:'100%',maxWidth:340}}>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{width:'100%',marginBottom:16,padding:13,borderRadius:6,border:'1.5px solid #bbb',fontSize:'1.08rem',background:'#f7faff'}} />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} style={{width:'100%',marginBottom:22,padding:13,borderRadius:6,border:'1.5px solid #bbb',fontSize:'1.08rem',background:'#f7faff'}} />
            <button type="submit" style={{width:'100%',padding:13,borderRadius:6,background:'#1a237e',color:'#fff',fontWeight:700,fontSize:'1.13rem',border:'none',cursor:'pointer',letterSpacing:'0.5px',boxShadow:'0 2px 8px rgba(26,35,126,0.08)'}}>Login</button>
          </form>
          <div style={{marginTop:22}}>
            <span style={{fontSize:'1.08rem',color:'#444'}}>New user? <button type="button" onClick={() => navigate('/register')} style={{color:'#1a237e',textDecoration:'underline',background:'none',border:'none',padding:0,cursor:'pointer',fontWeight:600}}>Register here</button></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
