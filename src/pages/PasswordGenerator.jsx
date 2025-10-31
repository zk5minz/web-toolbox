import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './PasswordGenerator.css';

function PasswordGenerator() {
  const { t } = useTranslation(['passwordGenerator', 'translation']);

  // Set canonical URL
  useCanonicalUrl('/password-generator');

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Free Password Generator - Strong & Secure Passwords | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Generate strong and secure passwords with customizable options. Free password generator with uppercase, lowercase, numbers, and symbols. 100% private and secure.');
    }
  }, []);
  
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  });
  const [copyText, setCopyText] = useState('Copy');

  // Character sets
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const similarChars = 'il1Lo0O';
  const ambiguousChars = '{}[]()<>';

  // Load settings from localStorage
  useEffect(() => {
    const savedLength = localStorage.getItem('passwordLength');
    const savedOptions = localStorage.getItem('passwordOptions');

    if (savedLength) setLength(parseInt(savedLength));
    if (savedOptions) setOptions(JSON.parse(savedOptions));
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('passwordLength', length.toString());
    localStorage.setItem('passwordOptions', JSON.stringify(options));
  }, [length, options]);

  // Generate password on mount and when options change
  useEffect(() => {
    generatePassword();
  }, [length, options]);

  // Update copy button text when language changes
  useEffect(() => {
    setCopyText(t('passwordGenerator:buttons.copy'));
  }, [t]);

  const generatePassword = () => {
    let charset = '';
    let guaranteedChars = '';

    // Build character set based on options
    if (options.uppercase) {
      let chars = charSets.uppercase;
      if (options.excludeSimilar) chars = chars.replace(/[IL]/g, '');
      charset += chars;
      guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
    }

    if (options.lowercase) {
      let chars = charSets.lowercase;
      if (options.excludeSimilar) chars = chars.replace(/[ilo]/g, '');
      charset += chars;
      guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
    }

    if (options.numbers) {
      let chars = charSets.numbers;
      if (options.excludeSimilar) chars = chars.replace(/[01]/g, '');
      charset += chars;
      guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
    }

    if (options.symbols) {
      let chars = charSets.symbols;
      if (options.excludeAmbiguous) {
        chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
      }
      charset += chars;
      guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
    }

    // Ensure at least one option is selected
    if (charset === '') {
      setPassword(t('passwordGenerator:passwordDisplay.selectAtLeastOne'));
      return;
    }

    // Generate password
    let newPassword = guaranteedChars;
    const remainingLength = length - guaranteedChars.length;

    for (let i = 0; i < remainingLength; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
  };

  const calculateStrength = () => {
    if (!password || password.includes(t('passwordGenerator:passwordDisplay.selectAtLeastOne'))) {
      return { text: t('passwordGenerator:strength.none'), color: '#999', percentage: 0 };
    }

    let score = 0;

    // Length score
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length >= 20) score += 1;

    // Variety score
    if (options.uppercase) score += 1;
    if (options.lowercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;

    const percentage = (score / 8) * 100;

    if (score <= 3) return { text: t('passwordGenerator:strength.weak'), color: '#ef4444', percentage };
    if (score <= 5) return { text: t('passwordGenerator:strength.medium'), color: '#f59e0b', percentage };
    if (score <= 6) return { text: t('passwordGenerator:strength.strong'), color: '#10b981', percentage };
    return { text: t('passwordGenerator:strength.veryStrong'), color: '#059669', percentage };
  };

  const handleCopy = async () => {
    if (!password || password.includes(t('passwordGenerator:passwordDisplay.selectAtLeastOne'))) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopyText(t('passwordGenerator:buttons.copied'));
      setTimeout(() => setCopyText(t('passwordGenerator:buttons.copy')), 2000);
    } catch (err) {
      alert('Failed to copy password');
    }
  };

  const handleOptionChange = (option) => {
    const newOptions = { ...options, [option]: !options[option] };

    // Ensure at least one character type is selected
    if (!newOptions.uppercase && !newOptions.lowercase && !newOptions.numbers && !newOptions.symbols) {
      return;
    }

    setOptions(newOptions);
  };

  const strength = calculateStrength();

  return (
    <div className="password-generator-container">
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>

      <header className="password-generator-header">
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
          <span>{t('passwordGenerator:breadcrumb.tools')}</span>
          <span> &gt; </span>
          <span>{t('passwordGenerator:breadcrumb.current')}</span>
        </div>
        <h1 style={{
          fontSize: '56px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          margin: '0'
        }}>
          <span>🔐</span>
          <span>{t('passwordGenerator:header.title')}</span>
        </h1>
        <p style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '40px'
        }}>
          {t('passwordGenerator:header.subtitle')}
        </p>
      </header>

      <div className="password-generator-content">
        <div className="password-display-section">
          <label className="section-label">{t('passwordGenerator:passwordDisplay.label')}</label>
          <div className="password-display-wrapper">
            <input
              type="text"
              value={password}
              readOnly
              className="password-display"
            />
            <div className="password-buttons">
              <button onClick={generatePassword} className="regenerate-btn">
                {t('passwordGenerator:buttons.regenerate')}
              </button>
              <button onClick={handleCopy} className="copy-btn">
                {copyText}
              </button>
            </div>
          </div>
        </div>

        <div className="password-strength-section">
          <label className="section-label">{t('passwordGenerator:strength.label')}</label>
          <div className="strength-bar-container">
            <div
              className="strength-bar"
              style={{
                width: `${strength.percentage}%`,
                backgroundColor: strength.color
              }}
            />
          </div>
          <p className="strength-text" style={{ color: strength.color }}>
            {strength.text}
          </p>
        </div>

        <div className="password-options-section">
          <div className="length-section">
            <label className="section-label">
              {t('passwordGenerator:length.label')}: <span className="length-value">{length}</span>
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="length-slider"
            />
            <div className="length-labels">
              <span>8</span>
              <span>32</span>
            </div>
          </div>

          <div className="character-options">
            <label className="section-label">{t('passwordGenerator:characters.label')}</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={() => handleOptionChange('uppercase')}
                />
                <span>{t('passwordGenerator:characters.uppercase')}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={() => handleOptionChange('lowercase')}
                />
                <span>{t('passwordGenerator:characters.lowercase')}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={() => handleOptionChange('numbers')}
                />
                <span>{t('passwordGenerator:characters.numbers')}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={() => handleOptionChange('symbols')}
                />
                <span>{t('passwordGenerator:characters.symbols')}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={() => handleOptionChange('excludeSimilar')}
                />
                <span>{t('passwordGenerator:characters.excludeSimilar')}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={() => handleOptionChange('excludeAmbiguous')}
                />
                <span>{t('passwordGenerator:characters.excludeAmbiguous')}</span>
              </label>
            </div>
          </div>
        </div>

        <button onClick={generatePassword} className="generate-btn">
          {t('passwordGenerator:buttons.generate')}
        </button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>{t('passwordGenerator:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('passwordGenerator:features.secure.title')}</h3>
            <p>{t('passwordGenerator:features.secure.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>{t('passwordGenerator:features.strong.title')}</h3>
            <p>{t('passwordGenerator:features.strong.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>{t('passwordGenerator:features.customizable.title')}</h3>
            <p>{t('passwordGenerator:features.customizable.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('passwordGenerator:features.strengthCheck.title')}</h3>
            <p>{t('passwordGenerator:features.strengthCheck.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>{t('passwordGenerator:features.copy.title')}</h3>
            <p>{t('passwordGenerator:features.copy.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('passwordGenerator:features.free.title')}</h3>
            <p>{t('passwordGenerator:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordGenerator;
