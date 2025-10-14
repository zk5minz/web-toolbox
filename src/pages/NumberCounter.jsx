import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './NumberCounter.css';

function NumberCounter() {
  const { t } = useTranslation(['numbercounter', 'translation']);
  
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
    // SEO Meta Tags
    document.title = 'Free Number Counter - Simple Click Counter Tool | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Simple number counter with increment and decrement buttons. Customizable settings, auto-save, and history tracking. Free online click counter tool.');
    }
    
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
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <LanguageSwitcher />
        </div>
        <div className="breadcrumb">
          <Link
            to="/"
            className="breadcrumb-home-link"
            style={{
              background: 'white',
              color: '#6366f1',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'underline',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1e40af';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#6366f1';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏠 {t('translation:nav.home')}
          </Link>
          <span> &gt; </span>
          <span>{t('numbercounter:breadcrumb.tools')}</span>
          <span> &gt; </span>
          <span>{t('numbercounter:breadcrumb.current')}</span>
        </div>

        <div className="title-section-centered">
          <h1>🔢 {t('numbercounter:header.title')}</h1>
          <p>{t('numbercounter:header.subtitle')}</p>
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
            {t('numbercounter:buttons.reset')}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('numbercounter:settings.title')}</h2>

            <div className="settings-section">
              <div className="settings-row">
                <label className="settings-label">{t('numbercounter:settings.limits')}</label>
                <button
                  className={`toggle-switch ${limitsEnabled ? 'on' : 'off'}`}
                  onClick={() => setLimitsEnabled(!limitsEnabled)}
                >
                  <span className="toggle-label">{limitsEnabled ? t('numbercounter:settings.on') : t('numbercounter:settings.off')}</span>
                  <span className="toggle-slider"></span>
                </button>
              </div>

              <div className="settings-row">
                <label className="settings-label">{t('numbercounter:settings.maximum')}</label>
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
                  {t('numbercounter:settings.background')}
                </button>
                <button
                  className={`color-tab ${colorTab === 'font' ? 'active' : ''}`}
                  onClick={() => setColorTab('font')}
                >
                  {t('numbercounter:settings.fontColor')}
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
              {t('numbercounter:buttons.resetSettings')}
            </button>

            <button
              className="modal-close-btn"
              onClick={() => setShowSettings(false)}
            >
              {t('numbercounter:buttons.close')}
            </button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="features-section">
        <h2>{t('numbercounter:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('numbercounter:features.private.title')}</h3>
            <p>{t('numbercounter:features.private.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>{t('numbercounter:features.autoSave.title')}</h3>
            <p>{t('numbercounter:features.autoSave.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>{t('numbercounter:features.customizable.title')}</h3>
            <p>{t('numbercounter:features.customizable.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>{t('numbercounter:features.history.title')}</h3>
            <p>{t('numbercounter:features.history.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>{t('numbercounter:features.shortcuts.title')}</h3>
            <p>{t('numbercounter:features.shortcuts.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('numbercounter:features.free.title')}</h3>
            <p>{t('numbercounter:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NumberCounter;
