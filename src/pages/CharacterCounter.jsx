import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './CharacterCounter.css';

function CharacterCounter() {
  const { t, i18n } = useTranslation(['characterCounter', 'translation']);
  const [text, setText] = useState('');

  // Load saved text from localStorage
  useEffect(() => {
    // SEO Meta Tags
    document.title = t('characterCounter:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('characterCounter:metaDescription'));
    }
    
    const savedText = localStorage.getItem('characterCounterText');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // Save text to localStorage
  useEffect(() => {
    localStorage.setItem('characterCounterText', text);
  }, [text]);

  // Calculate statistics
  const getStats = () => {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, '').length;

    // Words: split by whitespace and filter empty strings
    const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;

    // Sentences: split by . ! ? followed by space or end
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraphs: split by one or more newlines
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Lines: split by newlines
    const lines = text.split(/\n/).filter(l => l.length > 0);
    const lineCount = lines.length;

    // Numbers: count all digits
    const numbers = text.match(/\d/g) || [];
    const numberCount = numbers.length;

    // Special characters: not alphanumeric, not whitespace
    const specialChars = text.match(/[^\w\s\u3131-\uD79D]/g) || [];
    const specialCharCount = specialChars.length;

    // Korean characters
    const koreanChars = text.match(/[\u3131-\uD79D]/g) || [];
    const koreanCharCount = koreanChars.length;

    // English characters
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    const englishCharCount = englishChars.length;

    // Average word length
    const totalWordChars = words.join('').length;
    const avgWordLength = wordCount > 0 ? (totalWordChars / wordCount).toFixed(1) : 0;

    // Reading time (200 words per minute)
    const readingTime = wordCount > 0 ? Math.ceil(wordCount / 200) : 0;

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      lineCount,
      numberCount,
      specialCharCount,
      koreanCharCount,
      englishCharCount,
      avgWordLength,
      readingTime
    };
  };

  const stats = getStats();

  const handleClear = () => {
    if (confirm(t('characterCounter:messages.confirmClear'))) {
      setText('');
    }
  };

  const handleCopyStats = () => {
    const statsText = `Text Statistics:
Characters (with spaces): ${stats.charsWithSpaces}
Characters (without spaces): ${stats.charsWithoutSpaces}
Words: ${stats.wordCount}
Sentences: ${stats.sentenceCount}
Paragraphs: ${stats.paragraphCount}
Lines: ${stats.lineCount}
Numbers: ${stats.numberCount}
Special Characters: ${stats.specialCharCount}
Korean Characters: ${stats.koreanCharCount}
English Characters: ${stats.englishCharCount}
Average Word Length: ${stats.avgWordLength}
Reading Time: ${stats.readingTime} min`;

    navigator.clipboard.writeText(statsText).then(() => {
      alert(t('characterCounter:messages.statsCopied'));
    });
  };

  return (
    <div className="character-counter-container">
      <header className="character-counter-header">
        {/* Language Switcher */}
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
          <span>{t('translation:nav.tools')}</span>
          <span> &gt; </span>
          <span>{t('characterCounter:breadcrumb.characterCounter')}</span>
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
          <span>🔠</span>
          <span>{t('characterCounter:title')}</span>
        </h1>
        <p style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '40px'
        }}>
          {t('characterCounter:subtitle')}
        </p>
      </header>

      <div className="character-counter-content">
        <div className="text-input-section">
          <div className="input-header">
            <h2>{t('characterCounter:buttons.textInput')}</h2>
            <button onClick={handleClear} className="clear-btn">
              🗑️ {t('characterCounter:buttons.clear')}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('characterCounter:placeholder')}
            className="text-input"
          />
        </div>

        <div className="stats-panel">
          <div className="stats-header">
            <h2>{t('characterCounter:stats.title')}</h2>
            <button onClick={handleCopyStats} className="copy-stats-btn">
              📋 {t('characterCounter:buttons.copyStats')}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.characters')}</div>
                <div className="stat-value">{stats.charsWithSpaces}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✏️</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.charactersNoSpaces')}</div>
                <div className="stat-value">{stats.charsWithoutSpaces}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.words')}</div>
                <div className="stat-value">{stats.wordCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.sentences')}</div>
                <div className="stat-value">{stats.sentenceCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.paragraphs')}</div>
                <div className="stat-value">{stats.paragraphCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.lines')}</div>
                <div className="stat-value">{stats.lineCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔢</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.numbers')}</div>
                <div className="stat-value">{stats.numberCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.specialChars')}</div>
                <div className="stat-value">{stats.specialCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🇰🇷</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.koreanChars')}</div>
                <div className="stat-value">{stats.koreanCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🇬🇧</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.englishChars')}</div>
                <div className="stat-value">{stats.englishCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.avgWordLength')}</div>
                <div className="stat-value">{stats.avgWordLength}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-label">{t('characterCounter:stats.readingTime')}</div>
                <div className="stat-value">{stats.readingTime} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>{t('characterCounter:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('characterCounter:features.private.title')}</h3>
            <p>{t('characterCounter:features.private.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('characterCounter:features.realtime.title')}</h3>
            <p>{t('characterCounter:features.realtime.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('characterCounter:features.detailed.title')}</h3>
            <p>{t('characterCounter:features.detailed.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>{t('characterCounter:features.autosave.title')}</h3>
            <p>{t('characterCounter:features.autosave.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>{t('characterCounter:features.textTools.title')}</h3>
            <p>{t('characterCounter:features.textTools.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('characterCounter:features.free.title')}</h3>
            <p>{t('characterCounter:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterCounter;
