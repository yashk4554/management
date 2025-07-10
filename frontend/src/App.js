import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import Home from './pages/Home';
// import About from './pages/About';
import Register from './pages/Register';
import Login from './pages/Login';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import UserDashboard from './components/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './pages/form.css';
import './components/complaint.css';




import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppRoutes() {
  const { user, role, logout } = useContext(AuthContext);
  const isLoggedIn = !!user && role === 'user';
  const isAdmin = !!user && role === 'admin';
  return (
    <Router>
      {(isLoggedIn || isAdmin) && (
        <nav style={{
          padding: 16,
          background: '#1a237e',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <Link to="/" style={{ marginRight: 18, color: '#fff', fontWeight: 500, textDecoration: 'none' }}>Home</Link>
          {isLoggedIn && <Link to="/dashboard" style={{ marginRight: 18, color: '#fff', fontWeight: 500, textDecoration: 'none' }}>Dashboard</Link>}
          {isAdmin && <Link to="/admin/dashboard" style={{ marginRight: 18, color: '#fff', fontWeight: 500, textDecoration: 'none' }}>Admin Dashboard</Link>}
          {(isLoggedIn || isAdmin) && <button onClick={logout} style={{ marginLeft: 18, background:'#fff',color:'#1a237e',border:'none',padding:'8px 18px',borderRadius:6,fontWeight:600,cursor:'pointer' }}>Logout</button>}
        </nav>
      )}
      <div className="container" style={{padding:0}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={!isLoggedIn ? <Register /> : <Home />} />
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Home />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/login" element={!isAdmin ? <AdminLogin /> : <Home />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
