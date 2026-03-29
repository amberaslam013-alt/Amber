import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const MyBookings = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mt-4">
      <h1>My Bookings</h1>
      <p>Your bookings will appear here...</p>
    </div>
  );
};

export default MyBookings;
