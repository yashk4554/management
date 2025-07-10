import React from 'react';
import { Navigate } from 'react-router-dom';


import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'admin' || localStorage.getItem('adminToken');
  return isAdmin ? children : <Navigate to="/admin/login" />;
};

export default AdminRoute;
