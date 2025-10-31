import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './AudioConverter.css';

function AudioConverter() {
  const { t } = useTranslation(['audioConverter', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/audio-converter');
  
  const [audioFile, setAudioFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192');
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [convertedFile, setConvertedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFFmpeg();
    // SEO Meta Tags
    document.title = t('audioConverter:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('audioConverter:metaDescription'));
    }
  }, [t]);

  const loadFFmpeg = async () => {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      console.log('✅ FFmpeg loaded successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Failed to load FFmpeg:', err);
      setError(t('audioConverter:errors.loadFailed'));
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError(t('audioConverter:errors.fileTooLarge'));
        return;
      }
      setAudioFile(file);
      setConvertedFile(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      if (file.size > 100 * 1024 * 1024) {
        setError(t('audioConverter:errors.fileTooLarge'));
        return;
      }
      setAudioFile(file);
      setConvertedFile(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const convertAudio = async () => {
    if (!audioFile) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write input file
      await ffmpeg.writeFile('input', await fetchFile(audioFile));

      // Build FFmpeg command
      const outputFileName = `output.${outputFormat}`;
      const args = [
        '-i', 'input',
        '-b:a', `${bitrate}k`,
      ];

      // Add format-specific options
      if (outputFormat === 'mp3') {
        args.push('-codec:a', 'libmp3lame');
      } else if (outputFormat === 'ogg') {
        args.push('-codec:a', 'libvorbis');
      }

      args.push(outputFileName);

      // Execute conversion
      await ffmpeg.exec(args);

      // Read output file
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data.buffer], { 
        type: `audio/${outputFormat}` 
      });
      const url = URL.createObjectURL(blob);

      setConvertedFile({
        url,
        blob,
        name: audioFile.name.replace(/\.[^/.]+$/, '') + `.${outputFormat}`
      });

      // Cleanup
      await ffmpeg.deleteFile('input');
      await ffmpeg.deleteFile(outputFileName);

    } catch (err) {
      console.error('Conversion error:', err);
      setError(t('audioConverter:errors.conversionFailed'));
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile.url;
    link.download = convertedFile.name;
    link.click();
  };

  const handleReset = () => {
    setAudioFile(null);
    setConvertedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="audio-converter-container">
      <header className="audio-converter-header">
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
          <span>{t('audioConverter:breadcrumb.audioConverter')}</span>
        </div>
        <h1>{t('audioConverter:title')}</h1>
        <p>{t('audioConverter:subtitle')}</p>
      </header>

      <div className="audio-converter-content">
        {isLoading ? (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>{t('audioConverter:loading.title')}</p>
            <p className="loading-hint">{t('audioConverter:loading.hint')}</p>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            {!audioFile ? (
              <div
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">🎵</div>
                <h2>{t('audioConverter:upload.dragDrop')}</h2>
                <p>{t('audioConverter:upload.or')} {t('audioConverter:upload.clickUpload')}</p>
                <p className="upload-hint">{t('audioConverter:upload.supportedFormats')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="converter-panel">
                {/* File Info */}
                <div className="file-info">
                  <div className="file-icon">📁</div>
                  <div className="file-details">
                    <h3>{audioFile.name}</h3>
                    <p>{(audioFile.size / (1024 * 1024)).toFixed(2)} {t('audioConverter:fileInfo.size')}</p>
                  </div>
                  <button onClick={handleReset} className="remove-btn">
                    {t('audioConverter:buttons.remove')}
                  </button>
                </div>

                {/* Conversion Options */}
                <div className="conversion-options">
                  <div className="option-group">
                    <label>{t('audioConverter:options.outputFormat')}</label>
                    <div className="format-buttons">
                      {['mp3', 'wav', 'ogg', 'm4a', 'flac'].map(format => (
                        <button
                          key={format}
                          className={`format-btn ${outputFormat === format ? 'active' : ''}`}
                          onClick={() => setOutputFormat(format)}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="option-group">
                    <label>
                      {t('audioConverter:options.quality')} <span className="quality-value">{bitrate} {t('audioConverter:options.kbps')}</span>
                    </label>
                    <input
                      type="range"
                      min="64"
                      max="320"
                      step="32"
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                      className="quality-slider"
                    />
                    <div className="quality-labels">
                      <span>{t('audioConverter:options.qualityLabels.low')}</span>
                      <span>{t('audioConverter:options.qualityLabels.standard')}</span>
                      <span>{t('audioConverter:options.qualityLabels.high')}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                {/* Convert Button */}
                <button
                  onClick={convertAudio}
                  disabled={isConverting}
                  className="convert-btn"
                >
                  {isConverting ? (
                    <>
                      <div className="btn-spinner"></div>
                      {t('audioConverter:buttons.converting')} {progress}%
                    </>
                  ) : (
                    t('audioConverter:buttons.convert')
                  )}
                </button>

                {/* Download Button */}
                {convertedFile && (
                  <button onClick={handleDownload} className="download-btn">
                    {t('audioConverter:buttons.download')} {outputFormat.toUpperCase()}
                  </button>
                )}
              </div>
            )}

            {/* Features Section */}
            <div className="features-section">
              <h2>{t('audioConverter:features.title')}</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>{t('audioConverter:features.privateSecure.title')}</h3>
                  <p>{t('audioConverter:features.privateSecure.description')}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>{t('audioConverter:features.fastEfficient.title')}</h3>
                  <p>{t('audioConverter:features.fastEfficient.description')}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎵</div>
                  <h3>{t('audioConverter:features.multipleFormats.title')}</h3>
                  <p>{t('audioConverter:features.multipleFormats.description')}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💾</div>
                  <h3>{t('audioConverter:features.freeUnlimited.title')}</h3>
                  <p>{t('audioConverter:features.freeUnlimited.description')}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔧</div>
                  <h3>{t('audioConverter:features.qualityControl.title')}</h3>
                  <p>{t('audioConverter:features.qualityControl.description')}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>{t('audioConverter:features.worksOffline.title')}</h3>
                  <p>{t('audioConverter:features.worksOffline.description')}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AudioConverter;
