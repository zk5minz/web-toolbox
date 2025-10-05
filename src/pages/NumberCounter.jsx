import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NumberCounter.css';

function NumberCounter() {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [limitsEnabled, setLimitsEnabled] = useState(false);
  const [maximum, setMaximum] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState('#f5f7fa');
  const [fontColor, setFontColor] = useState('#333333');
  const [colorTab, setColorTab] = useState('background');

  const incrementOptions = [1, 3, 5, 10, 50, 100];

  const colorPalette = [
    '#000000', '#ffffff', '#FFB6C1', '#DDA0DD',
    '#87CEEB', '#A9A9A9', '#20B2AA', '#90EE90',
    '#FFE4B5', '#FFA500', '#FF6347', '#4169E1'
  ];

  // Load saved settings from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('numberCount');
    const savedIncrement = localStorage.getItem('numberIncrement');
    const savedLimits = localStorage.getItem('limitsEnabled');
    const savedMaximum = localStorage.getItem('maximum');
    const savedBgColor = localStorage.getItem('counterBgColor');
    const savedFontColor = localStorage.getItem('counterFontColor');

    if (savedCount) setCount(parseInt(savedCount));
    if (savedIncrement) setIncrement(parseInt(savedIncrement));
    if (savedLimits) setLimitsEnabled(JSON.parse(savedLimits));
    if (savedMaximum) setMaximum(parseInt(savedMaximum));
    if (savedBgColor) setBackgroundColor(savedBgColor);
    if (savedFontColor) setFontColor(savedFontColor);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('numberCount', count.toString());
    localStorage.setItem('numberIncrement', increment.toString());
    localStorage.setItem('limitsEnabled', JSON.stringify(limitsEnabled));
    localStorage.setItem('maximum', maximum.toString());
    localStorage.setItem('counterBgColor', backgroundColor);
    localStorage.setItem('counterFontColor', fontColor);
  }, [count, increment, limitsEnabled, maximum, backgroundColor, fontColor]);

  const handleIncrement = () => {
    const newValue = count + increment;
    if (limitsEnabled && newValue > maximum) {
      return;
    }
    setCount(newValue);
  };

  const handleDecrement = () => {
    setCount(count - increment);
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleResetSettings = () => {
    setCount(0);
    setIncrement(1);
    setLimitsEnabled(false);
    setMaximum(100);
    setBackgroundColor('#f5f7fa');
    setFontColor('#333333');
  };

  return (
    <div className="number-counter-container">
      <header className="number-counter-header">
        <div className="breadcrumb">
          <Link
            to="/"
            className="breadcrumb-home-link"
            style={{
              color: '#FFEB3B',
              fontWeight: '700',
              textDecoration: 'underline',
              textDecorationThickness: '1.5px',
              textDecorationColor: '#FFEB3B',
              textUnderlineOffset: '3px'
            }}
          >
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Tools</span>
          <span> &gt; </span>
          <span>Number Counter</span>
        </div>

        <div className="title-section-centered">
          <h1>🔢 Number Counter</h1>
          <p>Count numbers with customizable increments</p>
        </div>
      </header>

      <div className="number-counter-content">
        <button
          className="settings-icon-btn-inside"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙️
        </button>
        <div className="counter-main">
          <button
            className="counter-circle-btn decrement-btn"
            onClick={handleDecrement}
          >
            −
          </button>

          <div
            className="counter-display-large"
            style={{ backgroundColor, color: fontColor }}
          >
            {count}
          </div>

          <button
            className="counter-circle-btn increment-btn"
            onClick={handleIncrement}
          >
            +
          </button>
        </div>

        <div className="increment-selector">
          {incrementOptions.map((value) => (
            <button
              key={value}
              className={`increment-option ${increment === value ? 'selected' : ''}`}
              onClick={() => setIncrement(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="reset-button-container">
          <button className="reset-counter-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>

            <div className="settings-section">
              <div className="settings-row">
                <label className="settings-label">Limits</label>
                <button
                  className={`toggle-switch ${limitsEnabled ? 'on' : 'off'}`}
                  onClick={() => setLimitsEnabled(!limitsEnabled)}
                >
                  <span className="toggle-label">{limitsEnabled ? 'On' : 'Off'}</span>
                  <span className="toggle-slider"></span>
                </button>
              </div>

              <div className="settings-row">
                <label className="settings-label">Maximum</label>
                <input
                  type="number"
                  className="settings-input"
                  value={maximum}
                  onChange={(e) => setMaximum(parseInt(e.target.value) || 0)}
                  disabled={!limitsEnabled}
                />
              </div>
            </div>

            <div className="settings-section">
              <div className="color-tabs">
                <button
                  className={`color-tab ${colorTab === 'background' ? 'active' : ''}`}
                  onClick={() => setColorTab('background')}
                >
                  Background
                </button>
                <button
                  className={`color-tab ${colorTab === 'font' ? 'active' : ''}`}
                  onClick={() => setColorTab('font')}
                >
                  Font Color
                </button>
              </div>

              <div className="color-palette">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${
                      (colorTab === 'background' && backgroundColor === color) ||
                      (colorTab === 'font' && fontColor === color)
                        ? 'selected'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (colorTab === 'background') {
                        setBackgroundColor(color);
                      } else {
                        setFontColor(color);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className="reset-settings-btn"
              onClick={handleResetSettings}
            >
              Reset Settings
            </button>

            <button
              className="modal-close-btn"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NumberCounter;
