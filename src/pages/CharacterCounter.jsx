import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CharacterCounter.css';

function CharacterCounter() {
  const [text, setText] = useState('');

  // Load saved text from localStorage
  useEffect(() => {
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
    if (confirm('Are you sure you want to clear all text?')) {
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
      alert('Statistics copied to clipboard!');
    });
  };

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
          <span>Word & Character Counter</span>
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
          <span>Word & Character Counter</span>
        </h1>
        <p style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '40px'
        }}>
          Analyze your text with real-time statistics
        </p>
      </header>

      <div className="character-counter-content">
        <div className="text-input-section">
          <div className="input-header">
            <h2>Text Input</h2>
            <button onClick={handleClear} className="clear-btn">
              🗑️ Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="text-input"
          />
        </div>

        <div className="stats-panel">
          <div className="stats-header">
            <h2>Statistics</h2>
            <button onClick={handleCopyStats} className="copy-stats-btn">
              📋 Copy Stats
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-label">Characters (with spaces)</div>
                <div className="stat-value">{stats.charsWithSpaces}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✏️</div>
              <div className="stat-info">
                <div className="stat-label">Characters (without spaces)</div>
                <div className="stat-value">{stats.charsWithoutSpaces}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-info">
                <div className="stat-label">Words</div>
                <div className="stat-value">{stats.wordCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <div className="stat-label">Sentences</div>
                <div className="stat-value">{stats.sentenceCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <div className="stat-label">Paragraphs</div>
                <div className="stat-value">{stats.paragraphCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <div className="stat-label">Lines</div>
                <div className="stat-value">{stats.lineCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔢</div>
              <div className="stat-info">
                <div className="stat-label">Numbers</div>
                <div className="stat-value">{stats.numberCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <div className="stat-label">Special Characters</div>
                <div className="stat-value">{stats.specialCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🇰🇷</div>
              <div className="stat-info">
                <div className="stat-label">Korean Characters</div>
                <div className="stat-value">{stats.koreanCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🇬🇧</div>
              <div className="stat-info">
                <div className="stat-label">English Characters</div>
                <div className="stat-value">{stats.englishCharCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Average Word Length</div>
                <div className="stat-value">{stats.avgWordLength}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-label">Reading Time</div>
                <div className="stat-value">{stats.readingTime} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Use Our Character Counter?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Private & Secure</h3>
            <p>All text analysis happens locally in your browser. Your content never leaves your device and is not stored anywhere.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Analysis</h3>
            <p>Instant character, word, and sentence counting as you type. No need to click any buttons or wait for results.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Statistics</h3>
            <p>Get comprehensive text analysis including word count, sentence count, reading time, and character type breakdown.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Multi-Language Support</h3>
            <p>Accurately counts Korean, English, numbers, and special characters separately for multilingual content.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Perfect for Writers</h3>
            <p>Ideal for essays, articles, social media posts, and any content with character or word limits.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>100% Free Forever</h3>
            <p>No registration, no limits, completely free. Count unlimited text with all features available at no cost.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterCounter;
