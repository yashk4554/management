import React from 'react';
import { Navigate } from 'react-router-dom';


import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const storedToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
  return storedToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
