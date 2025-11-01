import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { removeBackground } from '@imgly/background-removal';
import HeaderControls from '../components/HeaderControls';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './BackgroundRemover.css';

const BackgroundRemover = () => {
  const { t } = useTranslation(['backgroundRemover', 'translation']);

  // Set canonical URL
  useCanonicalUrl('/background-remover');

  // SEO Meta Tags
  useEffect(() => {
    document.title = t('backgroundRemover:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('backgroundRemover:metaDescription'));
    }
  }, [t]);
  
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    setError(null);

    // File size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('backgroundRemover:errors.fileTooLarge'));
      return;
    }

    // Format check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t('backgroundRemover:errors.unsupportedFormat'));
      return;
    }

    setIsProcessing(true);

    try {
      // Display original image
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImage(e.target.result);
      reader.readAsDataURL(file);

      // Remove background
      const blob = await removeBackground(file);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

    } catch (err) {
      console.error('Error:', err);
      setError(t('backgroundRemover:errors.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    link.click();
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="background-remover-container">
      {/* Header */}
      <div className="background-remover-header">
        <div className="background-remover-header-controls">
          <HeaderControls />
        </div>
        <div className="background-remover-breadcrumb">
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
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#6366f1';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🏠 {t('translation:nav.home')}
          </Link>
          <span> &gt; </span>
          <span>{t('backgroundRemover:breadcrumb.backgroundRemover')}</span>
        </div>
        <h1 className="background-remover-title">
          {t('backgroundRemover:header.title')}
        </h1>
        <p className="background-remover-subtitle">
          {t('backgroundRemover:header.description')}
        </p>
      </div>

      <div className="background-remover-content">

        {/* Main Content Card */}
        <div className="background-remover-card">
          {/* Error Message */}
          {error && (
            <div className="background-remover-error">
              ⚠️ {error}
            </div>
          )}

          {/* Upload Area */}
          {!originalImage && !isProcessing && (
            <>
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="background-remover-upload-area"
              >
                <div className="background-remover-upload-icon">📤</div>
                <h3 className="background-remover-upload-title">
                  {t('backgroundRemover:upload.dragDrop')}
                </h3>
                <p className="background-remover-upload-text">
                  {t('backgroundRemover:upload.or')} {t('backgroundRemover:upload.clickUpload')}
                </p>
                <p className="background-remover-upload-hint">
                  {t('backgroundRemover:upload.supportedFormats')}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="background-remover-processing">
              <div className="background-remover-spinner"></div>
              <h3 className="background-remover-processing-title">
                {t('backgroundRemover:processing.title')}
              </h3>
              <p className="background-remover-processing-text">
                {t('backgroundRemover:processing.description')}
              </p>
            </div>
          )}

          {/* Results */}
          {processedImage && !isProcessing && (
            <div>
              <h2 className="background-remover-results-title">
                <span>✨</span>
                <span>{t('backgroundRemover:results.title')}</span>
              </h2>

              {/* Before/After Comparison */}
              <div className="background-remover-comparison">
                {/* Original */}
                <div>
                  <h3 className="background-remover-comparison-label">
                    {t('backgroundRemover:results.before')}
                  </h3>
                  <div className="background-remover-comparison-original">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="background-remover-comparison-img"
                    />
                  </div>
                </div>

                {/* Processed */}
                <div>
                  <h3 className="background-remover-comparison-label">
                    {t('backgroundRemover:results.after')}
                  </h3>
                  <div className="background-remover-comparison-processed">
                    <img
                      src={processedImage}
                      alt="Background Removed"
                      className="background-remover-comparison-img"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="background-remover-buttons">
                <button onClick={handleDownload} className="background-remover-download-btn">
                  {t('backgroundRemover:buttons.download')}
                </button>

                <button onClick={resetAll} className="background-remover-reset-btn">
                  {t('backgroundRemover:buttons.tryAnother')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="background-remover-features">
        <h2 className="background-remover-features-title">{t('backgroundRemover:features.title')}</h2>
        <div className="background-remover-features-grid">
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">🔒</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.privateSecure.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.privateSecure.description')}</p>
          </div>
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">🤖</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.aiPowered.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.aiPowered.description')}</p>
          </div>
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">⚡</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.instantResults.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.instantResults.description')}</p>
          </div>
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">🖼️</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.transparentPng.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.transparentPng.description')}</p>
          </div>
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">📱</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.worksAnywhere.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.worksAnywhere.description')}</p>
          </div>
          <div className="background-remover-feature-card">
            <div className="background-remover-feature-icon">🆓</div>
            <h3 className="background-remover-feature-title">{t('backgroundRemover:features.free.title')}</h3>
            <p className="background-remover-feature-desc">{t('backgroundRemover:features.free.description')}</p>
          </div>
        </div>
      </div>

      {/* Add spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BackgroundRemover;
