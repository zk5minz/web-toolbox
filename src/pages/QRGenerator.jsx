import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './CharacterCounter.css';

function QRGenerator() {
  const qrRef = useRef(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('website');

  // Input states
  const [inputValue, setInputValue] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');

  // Customization states
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(256);
  const [downloadFormat, setDownloadFormat] = useState('PNG');
  const [errorLevel, setErrorLevel] = useState('M');
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // History state (in-memory only)
  const [qrHistory, setQrHistory] = useState([]);

  // Preset templates
  const presets = {
    instagram: { name: 'Instagram', url: 'https://instagram.com/' },
    twitter: { name: 'Twitter', url: 'https://twitter.com/' },
    facebook: { name: 'Facebook', url: 'https://facebook.com/' },
    linkedin: { name: 'LinkedIn', url: 'https://linkedin.com/' },
    youtube: { name: 'YouTube', url: 'https://youtube.com/' },
  };

  // Generate QR value based on active tab
  const getQRValue = () => {
    switch (activeTab) {
      case 'website':
        return inputValue;
      case 'text':
        return inputValue;
      case 'email':
        return `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNumber}`;
      case 'sms':
        return `sms:${smsNumber}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`;
      case 'wifi':
        return `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`;
      default:
        return inputValue;
    }
  };

  const qrValue = getQRValue();

  // Get placeholder text based on active tab
  const getPlaceholder = () => {
    switch (activeTab) {
      case 'website':
        return 'Enter website URL (e.g., https://example.com)';
      case 'text':
        return 'Enter any text you want to encode';
      case 'email':
        return 'Email address';
      case 'phone':
        return 'Enter phone number (e.g., +1234567890)';
      case 'sms':
        return 'Enter phone number';
      case 'wifi':
        return 'Network name (SSID)';
      case 'vcard':
        return 'Full name';
      default:
        return 'Enter content';
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!qrValue) {
      setError('Please enter content to generate QR code');
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      if (downloadFormat === 'SVG') {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      } else {
        const svg = qrRef.current.querySelector('svg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = qrSize;
        canvas.height = qrSize;

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          if (downloadFormat === 'JPG') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `qrcode-${Date.now()}.${downloadFormat.toLowerCase()}`;
            link.click();
            URL.revokeObjectURL(downloadUrl);
            setIsDownloading(false);
          }, `image/${downloadFormat.toLowerCase()}`);
        };

        img.src = url;
      }

      addToHistory();
    } catch (err) {
      setError('Failed to download QR code');
      setIsDownloading(false);
    }
  };

  // Add to history
  const addToHistory = () => {
    const historyItem = {
      value: qrValue,
      timestamp: Date.now(),
      type: activeTab,
      color: qrColor,
      bgColor: bgColor,
      size: qrSize,
    };

    setQrHistory((prev) => {
      const newHistory = [historyItem, ...prev].slice(0, 5);
      return newHistory;
    });
  };

  // Copy QR to clipboard
  const handleCopyToClipboard = async () => {
    if (!qrValue) {
      setError('Please enter content to generate QR code');
      return;
    }

    try {
      const svg = qrRef.current.querySelector('svg');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = qrSize;
      canvas.height = qrSize;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedToClipboard(true);
          setTimeout(() => setCopiedToClipboard(false), 2000);
        }, 'image/png');
      };

      img.src = url;
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Reset all fields
  const handleReset = () => {
    setInputValue('');
    setEmailAddress('');
    setEmailSubject('');
    setEmailBody('');
    setPhoneNumber('');
    setSmsNumber('');
    setSmsMessage('');
    setWifiSsid('');
    setWifiPassword('');
    setWifiSecurity('WPA');
    setVcardName('');
    setVcardPhone('');
    setVcardEmail('');
    setVcardOrg('');
    setQrColor('#000000');
    setBgColor('#ffffff');
    setQrSize(256);
    setDownloadFormat('PNG');
    setErrorLevel('M');
    setError('');
    setActiveTab('website');
  };

  // Apply preset
  const applyPreset = (preset) => {
    setActiveTab('website');
    setInputValue(preset.url);
  };

  // Load from history
  const loadFromHistory = (item) => {
    setActiveTab(item.type);
    setInputValue(item.value);
    setQrColor(item.color);
    setBgColor(item.bgColor);
    setQrSize(item.size);
  };

  const tabs = [
    { id: 'website', label: 'Website', icon: '🌐' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'phone', label: 'Phone', icon: '📞' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'vcard', label: 'vCard', icon: '👤' },
  ];

  return (
    <div className="character-counter-container">
      <header className="character-counter-header">
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
          <span>QR Code Generator</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '10px'
        }}>
          <img
            src="/qr-icon.png"
            alt="QR Code"
            style={{
              width: '64px',
              height: '64px'
            }}
          />
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0'
          }}>
            QR Code Generator
          </h1>
        </div>
        <p>Create custom QR codes for websites, text, contacts, and more</p>
      </header>

      <div className="character-counter-content">
        <div className="text-input-section">
          <div className="input-header">
            <h2>Quick Presets</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(preset)}
                className="copy-stats-btn"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="input-header">
            <h2>Content Type</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'copy-stats-btn' : 'clear-btn'}
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  background: activeTab === tab.id ? '#667eea' : '#9ca3af',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'website' || activeTab === 'text') && (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              className="text-input"
              style={{ minHeight: '100px' }}
            />
          )}

          {activeTab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Email address"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject (optional)"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Message (optional)"
                className="text-input"
                style={{ minHeight: '60px' }}
              />
            </div>
          )}

          {activeTab === 'phone' && (
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={getPlaceholder()}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          )}

          {activeTab === 'sms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="tel"
                value={smsNumber}
                onChange={(e) => setSmsNumber(e.target.value)}
                placeholder="Phone number"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Message (optional)"
                className="text-input"
                style={{ minHeight: '60px' }}
              />
            </div>
          )}

          {activeTab === 'wifi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                placeholder="Network name (SSID)"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Password"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <select
                value={wifiSecurity}
                onChange={(e) => setWifiSecurity(e.target.value)}
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          )}

          {activeTab === 'vcard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={vcardName}
                onChange={(e) => setVcardName(e.target.value)}
                placeholder="Full name"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <input
                type="tel"
                value={vcardPhone}
                onChange={(e) => setVcardPhone(e.target.value)}
                placeholder="Phone number"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <input
                type="email"
                value={vcardEmail}
                onChange={(e) => setVcardEmail(e.target.value)}
                placeholder="Email address"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                value={vcardOrg}
                onChange={(e) => setVcardOrg(e.target.value)}
                placeholder="Organization (optional)"
                style={{
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <div className="input-header">
              <h2>Customization</h2>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                  QR Color
                </label>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                  BG Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                Size: {qrSize}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                Error Correction
              </label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="L">Low</option>
                <option value="M">Medium</option>
                <option value="Q">Quartile</option>
                <option value="H">High</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                Format
              </label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="PNG">PNG</option>
                <option value="SVG">SVG</option>
                <option value="JPG">JPG</option>
              </select>
            </div>
          </div>
        </div>

        <div className="stats-panel">
          <div className="stats-header">
            <h2>Preview</h2>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '30px',
              backgroundColor: '#f5f7fa',
              borderRadius: '12px',
              marginBottom: '20px',
              minHeight: '300px',
            }}
          >
            <div ref={qrRef}>
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={qrSize}
                  bgColor={bgColor}
                  fgColor={qrColor}
                  level={errorLevel}
                />
              ) : (
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#999', textAlign: 'center' }}>
                  Enter content to generate QR code
                </div>
              )}
            </div>
          </div>

          {qrValue && (
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#666', marginBottom: '15px' }}>
              Size: {qrSize}px × {qrSize}px
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '10px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '15px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleDownload} disabled={isDownloading || !qrValue} className="copy-stats-btn">
              {isDownloading ? 'Downloading...' : `Download (${downloadFormat})`}
            </button>
            <button onClick={handleCopyToClipboard} disabled={!qrValue} className="copy-stats-btn">
              {copiedToClipboard ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button onClick={handleReset} className="clear-btn">
              Reset
            </button>
          </div>

          {qrHistory.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px' }}>Recent (Last 5)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {qrHistory.map((item) => (
                  <div
                    key={item.timestamp}
                    onClick={() => loadFromHistory(item)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f5f7fa',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f7fa';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <QRCodeSVG
                      value={item.value}
                      size={60}
                      bgColor={item.bgColor}
                      fgColor={item.color}
                      level="M"
                    />
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', marginTop: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRGenerator;
