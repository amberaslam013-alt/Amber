import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏨 Grand Hotel
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/rooms" onClick={() => setMobileMenuOpen(false)}>
            Rooms
          </Link>
          <Link to="/packages" onClick={() => setMobileMenuOpen(false)}>
            Packages
          </Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)}>
            Events
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>
                My Bookings
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                {user?.first_name || 'Profile'}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
