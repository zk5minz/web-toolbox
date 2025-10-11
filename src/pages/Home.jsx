import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const tools = [
    {
      id: 'image-converter',
      title: 'Image Converter',
      description: 'Convert PDF and images between different formats (PDF, JPEG, PNG, WEBP, etc.)',
      path: '/image-converter',
      icon: '🖼️'
    },
    {
      id: 'notepad',
      title: 'Notepad',
      description: 'Simple online notepad with auto-save and dark mode',
      path: '/notepad',
      icon: '📝'
    },
    {
      id: 'character-counter',
      title: 'Word & Character Counter',
      description: 'Count words, characters, sentences, and analyze text statistics',
      path: '/character-counter',
      icon: '🔠'
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Generate strong and secure passwords with customizable options',
      path: '/password-generator',
      icon: '🔐'
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
      id: 'world-clock',
      title: 'World Clock',
      description: 'Check the time around the world',
      path: '/world-clock',
      icon: '🌍'
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
      id: 'scientific-calculator',
      title: 'Scientific Calculator',
      description: 'Professional scientific calculator with advanced functions',
      path: '/scientific-calculator',
      icon: '/calculator-icon.png',
      isImage: true
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
    </div>
  );
}

export default Home;
