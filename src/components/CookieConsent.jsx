import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
    // Optionally: disable analytics and ads here
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <span className="cookie-icon">🍪</span>
          <div>
            <strong>We use cookies</strong>
            <p>
              We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. 
              By clicking "Accept", you consent to our use of cookies. 
              <Link to="/privacy-policy" className="cookie-link"> Learn more</Link>
            </p>
          </div>
        </div>
        <div className="cookie-consent-buttons">
          <button onClick={handleDecline} className="cookie-btn cookie-btn-decline">
            Decline
          </button>
          <button onClick={handleAccept} className="cookie-btn cookie-btn-accept">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
