
import { Link } from 'react-router';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column footer-description">
          <Link className="brand footer-brand" to="/">
            <span className="brand-symbol">🌿</span>
            <span className="brand-name">
              FarmLink
              <small>SRI LANKA</small>
            </span>
          </Link>

          <p>
            Connecting Sri Lankan farmers with families.
            Fresh food, fair prices, and stronger communities.
          </p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Our Products</Link>
          <Link to="/about">About FarmLink</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h3>Get Involved</h3>
          <Link to="/register">Join as a Customer</Link>
          <Link to="/register?role=farmer">Become a Farmer</Link>
          <Link to="/products">Explore Produce</Link>
        </div>

        <div className="footer-column">
          <h3>Our Mission</h3>
          <p>Support local farmers</p>
          <p>Promote fresh produce</p>
          <p>Connect communities</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 FarmLink Sri Lanka</span>
        <a href="#top">Back to top ↑</a>
        <span>Grown locally. Shared with care. 💚</span>
      </div>
    </footer>
  );
}

export default Footer;
