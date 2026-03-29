import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Grand Hotel Bad Pyrmont</h4>
            <p>Brunnenstraße 1, 31812 Bad Pyrmont, Germany</p>
            <p>Phone: +49 5281 1680</p>
            <p>Email: reservations@grandhotel.com</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/rooms">Rooms</a></li>
              <li><a href="/packages">Packages</a></li>
              <li><a href="/events">Events</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Policies</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#cancellation">Cancellation Policy</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#facebook">Facebook</a>
              <a href="#instagram">Instagram</a>
              <a href="#twitter">Twitter</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Grand Hotel Bad Pyrmont. All rights reserved.</p>
          <p>Luxury Wellness Resort · Bad Pyrmont, Germany</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
