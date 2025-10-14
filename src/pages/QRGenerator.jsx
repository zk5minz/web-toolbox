import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './CharacterCounter.css';

function QRGenerator() {
  const { t } = useTranslation(['qrgenerator', 'translation']);
  
  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Free QR Code Generator - Create Custom QR Codes | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create custom QR codes for URLs, text, WiFi, phone numbers, and more. Free QR code generator with customizable colors and download options (PNG, SVG, JPEG).');
    }
  }, []);
  
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
        return t('qrgenerator:placeholders.website');
      case 'text':
        return t('qrgenerator:placeholders.text');
      case 'email':
        return t('qrgenerator:placeholders.emailAddress');
      case 'phone':
        return t('qrgenerator:placeholders.phone');
      case 'sms':
        return t('qrgenerator:placeholders.smsNumber');
      case 'wifi':
        return t('qrgenerator:placeholders.wifiSsid');
      case 'vcard':
        return t('qrgenerator:placeholders.vcardName');
      default:
        return t('qrgenerator:placeholders.text');
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!qrValue) {
      setError(t('qrgenerator:errors.enterContent'));
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
      setError(t('qrgenerator:errors.downloadFailed'));
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
      setError(t('qrgenerator:errors.enterContent'));
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
      setError(t('qrgenerator:errors.copyFailed'));
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
    { id: 'website', label: t('qrgenerator:contentType.website'), icon: '🌐' },
    { id: 'text', label: t('qrgenerator:contentType.text'), icon: '📝' },
    { id: 'email', label: t('qrgenerator:contentType.email'), icon: '📧' },
    { id: 'phone', label: t('qrgenerator:contentType.phone'), icon: '📞' },
    { id: 'sms', label: t('qrgenerator:contentType.sms'), icon: '💬' },
    { id: 'wifi', label: t('qrgenerator:contentType.wifi'), icon: '📶' },
    { id: 'vcard', label: t('qrgenerator:contentType.vcard'), icon: '👤' },
  ];

  return (
    <div className="character-counter-container">
      <header className="character-counter-header">
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
          <span>{t('qrgenerator:breadcrumb.tools')}</span>
          <span> &gt; </span>
          <span>{t('qrgenerator:breadcrumb.current')}</span>
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
            {t('qrgenerator:header.title')}
          </h1>
        </div>
        <p>{t('qrgenerator:header.subtitle')}</p>
      </header>

      <div className="character-counter-content">
        <div className="text-input-section">
          <div className="input-header">
            <h2>{t('qrgenerator:presets.title')}</h2>
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
            <h2>{t('qrgenerator:contentType.title')}</h2>
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
                placeholder={t('qrgenerator:placeholders.emailAddress')}
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
                placeholder={t('qrgenerator:placeholders.emailSubject')}
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
                placeholder={t('qrgenerator:placeholders.emailBody')}
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
                placeholder={t('qrgenerator:placeholders.smsNumber')}
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
                placeholder={t('qrgenerator:placeholders.smsMessage')}
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
                placeholder={t('qrgenerator:placeholders.wifiSsid')}
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
                placeholder={t('qrgenerator:placeholders.wifiPassword')}
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
                <option value="WPA">{t('qrgenerator:customization.wifiSecurity.wpa')}</option>
                <option value="WEP">{t('qrgenerator:customization.wifiSecurity.wep')}</option>
                <option value="nopass">{t('qrgenerator:customization.wifiSecurity.nopass')}</option>
              </select>
            </div>
          )}

          {activeTab === 'vcard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={vcardName}
                onChange={(e) => setVcardName(e.target.value)}
                placeholder={t('qrgenerator:placeholders.vcardName')}
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
                placeholder={t('qrgenerator:placeholders.vcardPhone')}
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
                placeholder={t('qrgenerator:placeholders.vcardEmail')}
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
                placeholder={t('qrgenerator:placeholders.vcardOrg')}
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
              <h2>{t('qrgenerator:customization.title')}</h2>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                  {t('qrgenerator:customization.qrColor')}
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
                  {t('qrgenerator:customization.bgColor')}
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
                {t('qrgenerator:customization.size')}: {qrSize}px
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
                {t('qrgenerator:customization.errorCorrection')}
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
                <option value="L">{t('qrgenerator:customization.errorLevels.low')}</option>
                <option value="M">{t('qrgenerator:customization.errorLevels.medium')}</option>
                <option value="Q">{t('qrgenerator:customization.errorLevels.quartile')}</option>
                <option value="H">{t('qrgenerator:customization.errorLevels.high')}</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                {t('qrgenerator:customization.format')}
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
            <h2>{t('qrgenerator:preview.title')}</h2>
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
                  {t('qrgenerator:preview.emptyState')}
                </div>
              )}
            </div>
          </div>

          {qrValue && (
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#666', marginBottom: '15px' }}>
              {t('qrgenerator:preview.sizeLabel')}: {qrSize}px × {qrSize}px
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
              {isDownloading ? t('qrgenerator:buttons.downloading') : `${t('qrgenerator:buttons.download')} (${downloadFormat})`}
            </button>
            <button onClick={handleCopyToClipboard} disabled={!qrValue} className="copy-stats-btn">
              {copiedToClipboard ? `✓ ${t('qrgenerator:buttons.copied')}` : `📋 ${t('qrgenerator:buttons.copy')}`}
            </button>
            <button onClick={handleReset} className="clear-btn">
              {t('qrgenerator:buttons.reset')}
            </button>
          </div>

          {qrHistory.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px' }}>{t('qrgenerator:history.title')}</h3>
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

      {/* Features Section */}
      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: '2rem' }}>{t('qrgenerator:features.title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.private.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.private.description')}</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎨</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.customizable.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.customizable.description')}</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.multipleTypes.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.multipleTypes.description')}</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💾</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.downloadShare.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.downloadShare.description')}</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.history.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.history.description')}</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🆓</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('qrgenerator:features.free.title')}</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('qrgenerator:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRGenerator;
