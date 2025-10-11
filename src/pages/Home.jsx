import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const tools = [
    // 1열: 노트패드, 이미지변환기, 백그라운드리무버, 컬러추출기
    {
      id: 'notepad',
      title: 'Notepad',
      description: 'Simple online notepad with auto-save and dark mode',
      path: '/notepad',
      icon: '📝'
    },
    {
      id: 'image-converter',
      title: 'Image Converter',
      description: 'Convert PDF and images between different formats (PDF, JPEG, PNG, WEBP, etc.)',
      path: '/image-converter',
      icon: '🖼️'
    },
    {
      id: 'background-remover',
      title: 'Background Remover',
      description: 'Remove image backgrounds automatically with AI',
      path: '/background-remover',
      icon: '🪄'
    },
    {
      id: 'color-extractor',
      title: 'Color Extractor',
      description: 'Extract color palette from any image with HEX and RGB codes',
      path: '/color-extractor',
      icon: '🎨'
    },
    // 2열: 오디오변환기, 동영상변환기, QR생성기, 비밀번호생성기
    {
      id: 'audio-converter',
      title: 'Audio Converter',
      description: 'Convert audio files between MP3, WAV, OGG, M4A, and FLAC formats',
      path: '/audio-converter',
      icon: '🎵'
    },
    {
      id: 'video-converter',
      title: 'Video Converter',
      description: 'Convert video files between MP4, WEBM, AVI, and MOV formats',
      path: '/video-converter',
      icon: '🎬'
    },
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Create custom QR codes for URLs, text, WiFi, and more',
      path: '/qr-generator',
      icon: '/qr-icon.png',
      isImage: true
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Generate strong and secure passwords with customizable options',
      path: '/password-generator',
      icon: '🔐'
    },
    // 3열: 공학용계산기, 스탑워치&타이머, 넘버카운터, 글자캐릭터카운터
    {
      id: 'scientific-calculator',
      title: 'Scientific Calculator',
      description: 'Professional scientific calculator with advanced functions',
      path: '/scientific-calculator',
      icon: '/calculator-icon.png',
      isImage: true
    },
    {
      id: 'stopwatch-timer',
      title: 'Stopwatch & Timer',
      description: 'Track time with stopwatch and countdown timer',
      path: '/stopwatch-timer',
      icon: '⏱️'
    },
    {
      id: 'number-counter',
      title: 'Number Counter',
      description: 'Simple number counter with increment and decrement buttons',
      path: '/number-counter',
      icon: '🔢'
    },
    {
      id: 'character-counter',
      title: 'Word & Character Counter',
      description: 'Count words, characters, sentences, and analyze text statistics',
      path: '/character-counter',
      icon: '🔠'
    },
    // 4열: 세계시각
    {
      id: 'world-clock',
      title: 'World Clock',
      description: 'Check the time around the world',
      path: '/world-clock',
      icon: '🌍'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <header className="home-header">
          <h1>Online Tools</h1>
          <p>Free online tools for your daily needs</p>
        </header>

        <div className="tools-grid">
          {tools.map(tool => (
            <Link to={tool.path} key={tool.id} className="tool-card">
              <div className="tool-icon">
                {tool.icon.startsWith('/') ? (
                  <img src={tool.icon} alt={tool.title} style={{width: '48px', height: '48px'}} />
                ) : (
                  <div style={{fontSize: '48px'}}>{tool.icon}</div>
                )}
              </div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="why-choose-section">
        <h2>Why Choose Our Tools?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Private & Secure</h3>
            <p>All processing happens locally in your browser. Your files and data never leave your device and are not uploaded to any server.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>Completely Free</h3>
            <p>No hidden costs, no subscriptions, no premium features. All tools are 100% free with unlimited usage forever.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Easy</h3>
            <p>No installation or registration required. Just open your browser and start using our tools instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>No Data Collection</h3>
            <p>We don't track, store, or collect any of your data. Complete privacy protection guaranteed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Works Everywhere</h3>
            <p>Fully responsive design works on desktop, tablet, and mobile devices. Use our tools anywhere, anytime.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>No Limits</h3>
            <p>Process unlimited files with no restrictions on file size or number of conversions. Use as much as you need.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
