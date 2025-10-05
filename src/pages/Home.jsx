import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const tools = [
    {
      id: 'image-converter',
      title: 'Image Converter',
      description: 'Convert images between different formats (JPEG, PNG, WebP, etc.)',
      path: '/image-converter',
      icon: '🖼️'
    },
    {
      id: 'notepad',
      title: 'Notepad',
      description: 'Simple online notepad with auto-save and dark mode',
      path: '/notepad',
      icon: '📝'
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Online Tools</h1>
        <p>Free online tools for your daily needs</p>
      </header>

      <div className="tools-grid">
        {tools.map(tool => (
          <Link to={tool.path} key={tool.id} className="tool-card">
            <div className="tool-icon">{tool.icon}</div>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
