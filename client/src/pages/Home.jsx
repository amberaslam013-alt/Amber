import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Grand Hotel Bad Pyrmont</h1>
          <p>Luxury Wellness Resort in Germany's Premier Spa Town</p>
          <div className="hero-buttons">
            <Link to="/rooms" className="btn btn-primary">Book a Room</Link>
            <Link to="/packages" className="btn btn-secondary">Explore Packages</Link>
          </div>
        </div>
      </section>

      <section className="amenities container mt-4 mb-4">
        <h2>Our Amenities</h2>
        <div className="grid grid-3">
          <div className="card">
            <h3>🏊 Thermal Pools</h3>
            <p>1,500 m² of wellness with thermal spring water</p>
          </div>
          <div className="card">
            <h3>💆 Spa & Wellness</h3>
            <p>Ayurvedic treatments and holistic therapies</p>
          </div>
          <div className="card">
            <h3>🍽️ Fine Dining</h3>
            <p>Michelin-inspired healthy gourmet cuisine</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
