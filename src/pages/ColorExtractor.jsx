import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './ColorExtractor.css';

function ColorExtractor() {
  const { t } = useTranslation(['colorExtractor', 'translation']);

  // SEO Meta Tags
  useEffect(() => {
    document.title = t('colorExtractor:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('colorExtractor:metaDescription'));
    }
  }, [t]);
  
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        extractColors(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = (imageSrc) => {
    setIsExtracting(true);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Increase size for better color detection
      const maxSize = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      // Count colors with additional metrics
      const colorMap = {};
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Skip transparent pixels
        if (a < 128) continue;
        
        // Finer rounding for better detection
        const roundedR = Math.round(r / 5) * 5;
        const roundedG = Math.round(g / 5) * 5;
        const roundedB = Math.round(b / 5) * 5;
        
        const colorKey = `${roundedR},${roundedG},${roundedB}`;
        
        if (!colorMap[colorKey]) {
          // Calculate brightness and saturation
          const brightness = (roundedR + roundedG + roundedB) / 3;
          const max = Math.max(roundedR, roundedG, roundedB);
          const min = Math.min(roundedR, roundedG, roundedB);
          const saturation = max === 0 ? 0 : (max - min) / max;
          
          colorMap[colorKey] = {
            count: 0,
            r: roundedR,
            g: roundedG,
            b: roundedB,
            brightness,
            saturation
          };
        }
        colorMap[colorKey].count++;
      }
      
      // Convert to array and calculate score
      const colorArray = Object.values(colorMap).map(color => {
        // Score: frequency + bonus for bright/saturated colors
        const frequencyScore = color.count;
        const brightnessBonus = color.brightness > 200 ? color.count * 2 : 0;
        const saturationBonus = color.saturation > 0.5 ? color.count * 1.5 : 0;
        
        return {
          ...color,
          score: frequencyScore + brightnessBonus + saturationBonus
        };
      });
      
      // Sort by score
      colorArray.sort((a, b) => b.score - a.score);
      
      // Filter for diversity - avoid too similar colors
      const diverseColors = [];
      const minColorDistance = 30;
      
      for (const color of colorArray) {
        if (diverseColors.length >= 12) break;
        
        // Check if this color is different enough from already selected colors
        const isSimilar = diverseColors.some(selected => {
          const rDiff = Math.abs(selected.r - color.r);
          const gDiff = Math.abs(selected.g - color.g);
          const bDiff = Math.abs(selected.b - color.b);
          return rDiff < minColorDistance && gDiff < minColorDistance && bDiff < minColorDistance;
        });
        
        if (!isSimilar) {
          diverseColors.push(color);
        }
      }
      
      // Convert to final format
      const finalColors = diverseColors.map(color => ({
        rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
        hex: rgbToHex(color.r, color.g, color.b),
        r: color.r,
        g: color.g,
        b: color.b
      }));
      
      setColors(finalColors);
      setIsExtracting(false);
    };
    
    img.src = imageSrc;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        extractColors(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setImage(null);
    setColors([]);
    setCopiedIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="color-extractor-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <header className="color-extractor-header">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-home-link">
            🏠 {t('translation:nav.home')}
          </Link>
          <span> &gt; </span>
          <span>{t('translation:nav.tools')}</span>
          <span> &gt; </span>
          <span>{t('colorExtractor:breadcrumb.colorExtractor')}</span>
        </div>
        <h1>{t('colorExtractor:title')}</h1>
        <p>{t('colorExtractor:subtitle')}</p>
      </header>

      <div className="color-extractor-content">
        {!image ? (
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <h2>{t('colorExtractor:upload.dragDrop')}</h2>
            <p>{t('colorExtractor:upload.or')} {t('colorExtractor:upload.clickUpload')}</p>
            <p className="upload-hint">{t('colorExtractor:upload.supportedFormats')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="result-container">
            <div className="image-preview">
              <img src={image} alt="Uploaded" />
              <button onClick={handleReset} className="reset-btn">
                {t('colorExtractor:buttons.uploadNew')}
              </button>
            </div>

            {isExtracting ? (
              <div className="extracting-message">
                <div className="spinner"></div>
                <p>{t('colorExtractor:extracting.title')}</p>
              </div>
            ) : (
              <div className="colors-grid">
                <h2>{t('colorExtractor:palette.title')}</h2>
                <div className="palette">
                  {colors.map((color, index) => (
                    <div key={index} className="color-card">
                      <div
                        className="color-preview"
                        style={{ backgroundColor: color.rgb }}
                      ></div>
                      <div className="color-info">
                        <div className="color-code-row">
                          <span className="color-label">{t('colorExtractor:palette.hex')}</span>
                          <span className="color-code">{color.hex}</span>
                          <button
                            onClick={() => copyToClipboard(color.hex, `hex-${index}`)}
                            className="copy-btn-small"
                            title={t('colorExtractor:palette.copyHex')}
                          >
                            {copiedIndex === `hex-${index}` ? '✓' : '📋'}
                          </button>
                        </div>
                        <div className="color-code-row">
                          <span className="color-label">{t('colorExtractor:palette.rgb')}</span>
                          <span className="color-code">{`${color.r}, ${color.g}, ${color.b}`}</span>
                          <button
                            onClick={() => copyToClipboard(color.rgb, `rgb-${index}`)}
                            className="copy-btn-small"
                            title={t('colorExtractor:palette.copyRgb')}
                          >
                            {copiedIndex === `rgb-${index}` ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>{t('colorExtractor:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('colorExtractor:features.privateSecure.title')}</h3>
            <p>{t('colorExtractor:features.privateSecure.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>{t('colorExtractor:features.smartDetection.title')}</h3>
            <p>{t('colorExtractor:features.smartDetection.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('colorExtractor:features.multipleFormats.title')}</h3>
            <p>{t('colorExtractor:features.multipleFormats.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('colorExtractor:features.instantResults.title')}</h3>
            <p>{t('colorExtractor:features.instantResults.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3>{t('colorExtractor:features.anyImageType.title')}</h3>
            <p>{t('colorExtractor:features.anyImageType.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('colorExtractor:features.free.title')}</h3>
            <p>{t('colorExtractor:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorExtractor;
