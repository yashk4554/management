
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!form.email || !form.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      if (form.remember) {
        localStorage.setItem('token', res.data.token);
      } else {
        sessionStorage.setItem('token', res.data.token);
      }
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="toast-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <label style={{ display: 'block', margin: '10px 0' }}>
          <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} /> Remember me
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
};

export default Login;
