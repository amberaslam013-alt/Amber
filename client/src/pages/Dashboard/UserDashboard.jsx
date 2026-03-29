import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const UserDashboard = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mt-4">
      <h1>My Dashboard</h1>
      <p>Welcome, {user?.first_name}!</p>
      <p>Dashboard content coming soon...</p>
    </div>
  );
};

export default UserDashboard;
