import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/WorldClock.css';

const CITIES = [
  // Asia
  { name: 'Seoul', timezone: 'Asia/Seoul', flag: '🇰🇷', countryCode: 'KR', offset: 9 },
  { name: 'Busan', timezone: 'Asia/Seoul', flag: '🇰🇷', countryCode: 'KR', offset: 9 },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵', countryCode: 'JP', offset: 9 },
  { name: 'Osaka', timezone: 'Asia/Tokyo', flag: '🇯🇵', countryCode: 'JP', offset: 9 },
  { name: 'Beijing', timezone: 'Asia/Shanghai', flag: '🇨🇳', countryCode: 'CN', offset: 8 },
  { name: 'Shanghai', timezone: 'Asia/Shanghai', flag: '🇨🇳', countryCode: 'CN', offset: 8 },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰', countryCode: 'HK', offset: 8 },
  { name: 'Taipei', timezone: 'Asia/Taipei', flag: '🇹🇼', countryCode: 'TW', offset: 8 },
  { name: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', countryCode: 'SG', offset: 8 },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', flag: '🇹🇭', countryCode: 'TH', offset: 7 },
  { name: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', countryCode: 'VN', offset: 7 },
  { name: 'Ho Chi Minh', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', countryCode: 'VN', offset: 7 },
  { name: 'Jakarta', timezone: 'Asia/Jakarta', flag: '🇮🇩', countryCode: 'ID', offset: 7 },
  { name: 'Manila', timezone: 'Asia/Manila', flag: '🇵🇭', countryCode: 'PH', offset: 8 },
  { name: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾', countryCode: 'MY', offset: 8 },
  { name: 'New Delhi', timezone: 'Asia/Kolkata', flag: '🇮🇳', countryCode: 'IN', offset: 5.5 },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', flag: '🇮🇳', countryCode: 'IN', offset: 5.5 },
  { name: 'Dubai', timezone: 'Asia/Dubai', flag: '🇦🇪', countryCode: 'AE', offset: 4 },
  { name: 'Tel Aviv', timezone: 'Asia/Jerusalem', flag: '🇮🇱', countryCode: 'IL', offset: 2 },
  { name: 'Istanbul', timezone: 'Europe/Istanbul', flag: '🇹🇷', countryCode: 'TR', offset: 3 },

  // Europe
  { name: 'London', timezone: 'Europe/London', flag: '🇬🇧', countryCode: 'GB', offset: 0 },
  { name: 'Paris', timezone: 'Europe/Paris', flag: '🇫🇷', countryCode: 'FR', offset: 1 },
  { name: 'Berlin', timezone: 'Europe/Berlin', flag: '🇩🇪', countryCode: 'DE', offset: 1 },
  { name: 'Rome', timezone: 'Europe/Rome', flag: '🇮🇹', countryCode: 'IT', offset: 1 },
  { name: 'Madrid', timezone: 'Europe/Madrid', flag: '🇪🇸', countryCode: 'ES', offset: 1 },
  { name: 'Barcelona', timezone: 'Europe/Madrid', flag: '🇪🇸', countryCode: 'ES', offset: 1 },
  { name: 'Amsterdam', timezone: 'Europe/Amsterdam', flag: '🇳🇱', countryCode: 'NL', offset: 1 },
  { name: 'Brussels', timezone: 'Europe/Brussels', flag: '🇧🇪', countryCode: 'BE', offset: 1 },
  { name: 'Zurich', timezone: 'Europe/Zurich', flag: '🇨🇭', countryCode: 'CH', offset: 1 },
  { name: 'Vienna', timezone: 'Europe/Vienna', flag: '🇦🇹', countryCode: 'AT', offset: 1 },
  { name: 'Prague', timezone: 'Europe/Prague', flag: '🇨🇿', countryCode: 'CZ', offset: 1 },
  { name: 'Warsaw', timezone: 'Europe/Warsaw', flag: '🇵🇱', countryCode: 'PL', offset: 1 },
  { name: 'Stockholm', timezone: 'Europe/Stockholm', flag: '🇸🇪', countryCode: 'SE', offset: 1 },
  { name: 'Copenhagen', timezone: 'Europe/Copenhagen', flag: '🇩🇰', countryCode: 'DK', offset: 1 },
  { name: 'Oslo', timezone: 'Europe/Oslo', flag: '🇳🇴', countryCode: 'NO', offset: 1 },
  { name: 'Helsinki', timezone: 'Europe/Helsinki', flag: '🇫🇮', countryCode: 'FI', offset: 2 },
  { name: 'Dublin', timezone: 'Europe/Dublin', flag: '🇮🇪', countryCode: 'IE', offset: 0 },
  { name: 'Lisbon', timezone: 'Europe/Lisbon', flag: '🇵🇹', countryCode: 'PT', offset: 0 },
  { name: 'Athens', timezone: 'Europe/Athens', flag: '🇬🇷', countryCode: 'GR', offset: 2 },
  { name: 'Moscow', timezone: 'Europe/Moscow', flag: '🇷🇺', countryCode: 'RU', offset: 3 },

  // Americas
  { name: 'New York', timezone: 'America/New_York', flag: '🇺🇸', countryCode: 'US', offset: -5 },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', flag: '🇺🇸', countryCode: 'US', offset: -8 },
  { name: 'Chicago', timezone: 'America/Chicago', flag: '🇺🇸', countryCode: 'US', offset: -6 },
  { name: 'Houston', timezone: 'America/Chicago', flag: '🇺🇸', countryCode: 'US', offset: -6 },
  { name: 'Miami', timezone: 'America/New_York', flag: '🇺🇸', countryCode: 'US', offset: -5 },
  { name: 'San Francisco', timezone: 'America/Los_Angeles', flag: '🇺🇸', countryCode: 'US', offset: -8 },
  { name: 'Seattle', timezone: 'America/Los_Angeles', flag: '🇺🇸', countryCode: 'US', offset: -8 },
  { name: 'Las Vegas', timezone: 'America/Los_Angeles', flag: '🇺🇸', countryCode: 'US', offset: -8 },
  { name: 'Toronto', timezone: 'America/Toronto', flag: '🇨🇦', countryCode: 'CA', offset: -5 },
  { name: 'Vancouver', timezone: 'America/Vancouver', flag: '🇨🇦', countryCode: 'CA', offset: -8 },
  { name: 'Mexico City', timezone: 'America/Mexico_City', flag: '🇲🇽', countryCode: 'MX', offset: -6 },
  { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', countryCode: 'AR', offset: -3 },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', flag: '🇧🇷', countryCode: 'BR', offset: -3 },
  { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', flag: '🇧🇷', countryCode: 'BR', offset: -3 },
  { name: 'Santiago', timezone: 'America/Santiago', flag: '🇨🇱', countryCode: 'CL', offset: -3 },
  { name: 'Lima', timezone: 'America/Lima', flag: '🇵🇪', countryCode: 'PE', offset: -5 },

  // Oceania/Africa
  { name: 'Sydney', timezone: 'Australia/Sydney', flag: '🇦🇺', countryCode: 'AU', offset: 10 },
  { name: 'Melbourne', timezone: 'Australia/Melbourne', flag: '🇦🇺', countryCode: 'AU', offset: 10 },
  { name: 'Auckland', timezone: 'Pacific/Auckland', flag: '🇳🇿', countryCode: 'NZ', offset: 12 },
  { name: 'Cairo', timezone: 'Africa/Cairo', flag: '🇪🇬', countryCode: 'EG', offset: 2 },
  { name: 'Johannesburg', timezone: 'Africa/Johannesburg', flag: '🇿🇦', countryCode: 'ZA', offset: 2 },
  { name: 'Nairobi', timezone: 'Africa/Nairobi', flag: '🇰🇪', countryCode: 'KE', offset: 3 },
];

const DEFAULT_CITIES = ['Seoul', 'New York', 'London', 'Tokyo'];

function WorldClock() {
  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Free World Clock - Check Time Around the World | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Check current time around the world. Free world clock tool with multiple time zones, major cities worldwide. Real-time clock with date and UTC offset.');
    }
  }, []);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCities, setSelectedCities] = useState(DEFAULT_CITIES);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('worldClockCities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSelectedCities(parsed);
        }
      } catch (error) {
        console.error('Error loading saved cities:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('worldClockCities', JSON.stringify(selectedCities));
  }, [selectedCities]);

  const addCity = (cityName) => {
    if (!selectedCities.includes(cityName)) {
      setSelectedCities([...selectedCities, cityName]);
    }
    setShowModal(false);
    setSearchQuery('');
  };

  const removeCity = (cityName) => {
    setSelectedCities(selectedCities.filter(city => city !== cityName));
  };

  const getTimeForCity = (timezone) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getDateForCity = (timezone) => {
    return currentTime.toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatOffset = (offset) => {
    if (offset === 0) return 'UTC+0';
    const sign = offset > 0 ? '+' : '';
    return `UTC${sign}${offset}`;
  };

  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCities = selectedCities
    .map(cityName => CITIES.find(c => c.name === cityName))
    .filter(Boolean);

  const getCityDisplay = (city) => {
    return `${city.flag} ${city.name} (${city.countryCode})`;
  };

  return (
    <div className="world-clock-container">
      <div className="breadcrumb">
        <Link to="/" className="home-button">🏠 Home</Link>
        <span> &gt; World Clock</span>
      </div>

      <h1 className="world-clock-title">🌍 World Clock</h1>

      <div className="clocks-grid">
        {displayedCities.map((city) => (
          <div key={city.name} className="clock-card">
            <button
              className="remove-button"
              onClick={() => removeCity(city.name)}
              aria-label="Remove city"
            >
              ✕
            </button>
            <div className="city-name">{getCityDisplay(city)}</div>
            <div className="clock-time">{getTimeForCity(city.timezone)}</div>
            <div className="clock-date">{getDateForCity(city.timezone)}</div>
            <div className="clock-offset">{formatOffset(city.offset)}</div>
          </div>
        ))}

        <button className="add-city-button" onClick={() => setShowModal(true)}>
          ➕ Add City
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select City</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="city-list">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  className={`city-item ${selectedCities.includes(city.name) ? 'selected' : ''}`}
                  onClick={() => addCity(city.name)}
                >
                  {getCityDisplay(city)} <span className="city-offset">{formatOffset(city.offset)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Use Our World Clock?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Private & Secure</h3>
            <p>All time calculations are done locally in your browser. No tracking, no data collection, ensuring complete privacy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Coverage</h3>
            <p>Track time in major cities across all continents. From Seoul to New York, London to Sydney, access 100+ cities worldwide.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Real-Time Updates</h3>
            <p>Live clock display with automatic updates every second. Always shows accurate local time for all selected cities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Save Your Cities</h3>
            <p>Your selected cities are automatically saved in your browser. No need to re-add them every time you visit.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Search</h3>
            <p>Quick city search with timezone offset display. Find any city instantly with our intuitive search interface.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>100% Free Forever</h3>
            <p>No registration required, no limits. Track unlimited cities and timezones completely free with all features.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorldClock;
