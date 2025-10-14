import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Home.css';

function Home() {
  const { t, i18n } = useTranslation();
  
  // SEO Meta Tags
  useEffect(() => {
    document.title = t('home.metaTitle');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('home.metaDescription'));
    }
  }, [t, i18n.language]);

  const tools = [
    {
      id: 'notepad',
      title: t('tools.notepad.title'),
      description: t('tools.notepad.description'),
      path: '/notepad',
      icon: '📝'
    },
    {
      id: 'image-converter',
      title: t('tools.imageConverter.title'),
      description: t('tools.imageConverter.description'),
      path: '/image-converter',
      icon: '🖼️'
    },
    {
      id: 'background-remover',
      title: t('tools.backgroundRemover.title'),
      description: t('tools.backgroundRemover.description'),
      path: '/background-remover',
      icon: '🪄'
    },
    {
      id: 'color-extractor',
      title: t('tools.colorExtractor.title'),
      description: t('tools.colorExtractor.description'),
      path: '/color-extractor',
      icon: '🎨'
    },
    {
      id: 'audio-converter',
      title: t('tools.audioConverter.title'),
      description: t('tools.audioConverter.description'),
      path: '/audio-converter',
      icon: '🎵'
    },
    {
      id: 'video-converter',
      title: t('tools.videoConverter.title'),
      description: t('tools.videoConverter.description'),
      path: '/video-converter',
      icon: '🎬'
    },
    {
      id: 'qr-generator',
      title: t('tools.qrGenerator.title'),
      description: t('tools.qrGenerator.description'),
      path: '/qr-generator',
      icon: '/qr-icon.png',
      isImage: true
    },
    {
      id: 'password-generator',
      title: t('tools.passwordGenerator.title'),
      description: t('tools.passwordGenerator.description'),
      path: '/password-generator',
      icon: '🔐'
    },
    {
      id: 'scientific-calculator',
      title: t('tools.scientificCalculator.title'),
      description: t('tools.scientificCalculator.description'),
      path: '/scientific-calculator',
      icon: '/calculator-icon.png',
      isImage: true
    },
    {
      id: 'stopwatch-timer',
      title: t('tools.stopwatchTimer.title'),
      description: t('tools.stopwatchTimer.description'),
      path: '/stopwatch-timer',
      icon: '⏱️'
    },
    {
      id: 'number-counter',
      title: t('tools.numberCounter.title'),
      description: t('tools.numberCounter.description'),
      path: '/number-counter',
      icon: '🔢'
    },
    {
      id: 'character-counter',
      title: t('tools.characterCounter.title'),
      description: t('tools.characterCounter.description'),
      path: '/character-counter',
      icon: '🔠'
    },
    {
      id: 'world-clock',
      title: t('tools.worldClock.title'),
      description: t('tools.worldClock.description'),
      path: '/world-clock',
      icon: '🌍'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <header className="home-header">
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <LanguageSwitcher />
          </div>
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
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
        <h2>{t('features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('features.privateSecure.title')}</h3>
            <p>{t('features.privateSecure.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('features.completelyFree.title')}</h3>
            <p>{t('features.completelyFree.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('features.fastEasy.title')}</h3>
            <p>{t('features.fastEasy.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>{t('features.noDataCollection.title')}</h3>
            <p>{t('features.noDataCollection.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>{t('features.worksEverywhere.title')}</h3>
            <p>{t('features.worksEverywhere.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>{t('features.noLimits.title')}</h3>
            <p>{t('features.noLimits.description')}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('footer.about')}</h3>
            <ul>
              <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact">{t('footer.contact')}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>{t('footer.legal')}</h3>
            <ul>
              <li><Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/terms-of-service">{t('footer.termsOfService')}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>{t('footer.resources')}</h3>
            <ul>
              <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">{t('footer.sitemap')}</a></li>
              <li><a href="/robots.txt" target="_blank" rel="noopener noreferrer">{t('footer.robots')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.madeWith')}</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
