import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PasswordGenerator.css';

function PasswordGenerator() {
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
      setPassword('Please select at least one character type');
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
    if (!password || password.includes('Please select')) return { text: 'None', color: '#999', percentage: 0 };

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

    if (score <= 3) return { text: 'Weak', color: '#ef4444', percentage };
    if (score <= 5) return { text: 'Medium', color: '#f59e0b', percentage };
    if (score <= 6) return { text: 'Strong', color: '#10b981', percentage };
    return { text: 'Very Strong', color: '#059669', percentage };
  };

  const handleCopy = async () => {
    if (!password || password.includes('Please select')) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
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
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Tools</span>
          <span> &gt; </span>
          <span>Password Generator</span>
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
          <span>Password Generator</span>
        </h1>
        <p style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '40px'
        }}>
          Generate strong and secure passwords
        </p>
      </header>

      <div className="password-generator-content">
        <div className="password-display-section">
          <label className="section-label">Generated Password</label>
          <div className="password-display-wrapper">
            <input
              type="text"
              value={password}
              readOnly
              className="password-display"
            />
            <div className="password-buttons">
              <button onClick={generatePassword} className="regenerate-btn">
                Regenerate
              </button>
              <button onClick={handleCopy} className="copy-btn">
                {copyText}
              </button>
            </div>
          </div>
        </div>

        <div className="password-strength-section">
          <label className="section-label">Password Strength</label>
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
              Password Length: <span className="length-value">{length}</span>
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
            <label className="section-label">Include Characters</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={() => handleOptionChange('uppercase')}
                />
                <span>Uppercase Letters (A-Z)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={() => handleOptionChange('lowercase')}
                />
                <span>Lowercase Letters (a-z)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={() => handleOptionChange('numbers')}
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={() => handleOptionChange('symbols')}
                />
                <span>Special Characters (!@#$%^&*)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={() => handleOptionChange('excludeSimilar')}
                />
                <span>Exclude Similar Characters (i, l, 1, L, o, 0, O)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={() => handleOptionChange('excludeAmbiguous')}
                />
                <span>Exclude Ambiguous Symbols ({'{}<>[]()'})</span>
              </label>
            </div>
          </div>
        </div>

        <button onClick={generatePassword} className="generate-btn">
          Generate Password
        </button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Use Our Password Generator?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Secure & Private</h3>
            <p>All passwords are generated locally in your browser. Nothing is sent to any server, ensuring your passwords remain completely private.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Cryptographically Strong</h3>
            <p>Uses secure random number generation to create truly random passwords that are resistant to brute-force attacks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Fully Customizable</h3>
            <p>Choose length from 8-32 characters and select which character types to include: uppercase, lowercase, numbers, and symbols.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-Time Strength Check</h3>
            <p>Instantly see password strength with visual indicators and estimated crack time to ensure maximum security.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>One-Click Copy</h3>
            <p>Quickly copy generated passwords to clipboard with a single click. Perfect for fast password creation and usage.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>100% Free Forever</h3>
            <p>No registration required, no limits on usage. Generate unlimited secure passwords completely free of charge.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordGenerator;
