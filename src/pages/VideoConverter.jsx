import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './VideoConverter.css';

function VideoConverter() {
  const { t, i18n } = useTranslation(['videoConverter', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/video-converter');
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [quality, setQuality] = useState('medium');
  const [resolution, setResolution] = useState('original');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;
    
    setLoadingFFmpeg(true);
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpeg.on('progress', ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setFfmpegLoaded(true);
      console.log('✅ FFmpeg loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load FFmpeg:', error);
      alert('Failed to load video converter. Please refresh the page.');
    } finally {
      setLoadingFFmpeg(false);
    }
  };

  useEffect(() => {
    loadFFmpeg();
    // SEO Meta Tags
    document.title = t('videoConverter:meta.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('videoConverter:meta.description'));
    }
  }, [t, i18n.language]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setConvertedFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getFFmpegParams = () => {
    const params = [];
    
    // Audio-only formats
    const audioFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
    const isAudioFormat = audioFormats.includes(outputFormat);
    
    if (isAudioFormat) {
      // Audio extraction settings
      if (outputFormat === 'mp3') {
        const bitrateMap = { low: '128k', medium: '192k', high: '320k' };
        params.push('-vn', '-acodec', 'libmp3lame', '-ab', bitrateMap[quality]);
      } else if (outputFormat === 'wav') {
        params.push('-vn', '-acodec', 'pcm_s16le');
      } else if (outputFormat === 'aac') {
        const bitrateMap = { low: '128k', medium: '192k', high: '256k' };
        params.push('-vn', '-acodec', 'aac', '-ab', bitrateMap[quality]);
      } else if (outputFormat === 'm4a') {
        const bitrateMap = { low: '128k', medium: '192k', high: '256k' };
        params.push('-vn', '-acodec', 'aac', '-ab', bitrateMap[quality]);
      } else if (outputFormat === 'ogg') {
        const bitrateMap = { low: '128k', medium: '192k', high: '256k' };
        params.push('-vn', '-acodec', 'libvorbis', '-ab', bitrateMap[quality]);
      }
    } else {
      // Video conversion settings
      const qualityMap = {
        low: { crf: '28', preset: 'fast' },
        medium: { crf: '23', preset: 'medium' },
        high: { crf: '18', preset: 'slow' }
      };
      
      const q = qualityMap[quality];
      
      // Resolution
      if (resolution !== 'original') {
        params.push('-vf', `scale=${resolution}`);
      }
      
      // Format-specific settings
      if (outputFormat === 'mp4') {
        params.push('-c:v', 'libx264', '-crf', q.crf, '-preset', q.preset, '-c:a', 'aac');
      } else if (outputFormat === 'webm') {
        params.push('-c:v', 'libvpx-vp9', '-crf', q.crf, '-b:v', '0', '-c:a', 'libopus');
      } else if (outputFormat === 'avi') {
        params.push('-c:v', 'mpeg4', '-q:v', '3', '-c:a', 'mp3');
      } else if (outputFormat === 'mov') {
        params.push('-c:v', 'libx264', '-crf', q.crf, '-preset', q.preset, '-c:a', 'aac');
      }
    }
    
    return params;
  };

  const convertVideo = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsConverting(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
      const outputName = `output.${outputFormat}`;

      // Write input file
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Get conversion parameters
      const params = getFFmpegParams();

      // Run conversion
      await ffmpeg.exec(['-i', inputName, ...params, outputName]);

      // Read output file
      const data = await ffmpeg.readFile(outputName);
      const audioFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
      const isAudioFormat = audioFormats.includes(outputFormat);
      const mimeType = isAudioFormat ? `audio/${outputFormat === 'm4a' ? 'mp4' : outputFormat}` : `video/${outputFormat}`;
      const blob = new Blob([data.buffer], { type: mimeType });
      
      setConvertedFile({
        blob,
        name: file.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat,
        size: blob.size
      });

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

    } catch (error) {
      console.error('Conversion error:', error);
      alert('Video conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const downloadFile = () => {
    if (!convertedFile) return;
    const url = URL.createObjectURL(convertedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetConverter = () => {
    setFile(null);
    setConvertedFile(null);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="video-converter-container">
      <header className="video-converter-header">
        <div className="header-top">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-home-link">
              🏠 {t('videoConverter:breadcrumb.home')}
            </Link>
            <span> &gt; </span>
            <span>{t('videoConverter:breadcrumb.tools')}</span>
            <span> &gt; </span>
            <span>{t('videoConverter:breadcrumb.videoConverter')}</span>
          </div>
          <LanguageSwitcher />
        </div>
        <h1>🎬 {t('videoConverter:title')}</h1>
        <p>{t('videoConverter:description')}</p>
      </header>

      <div className="video-converter-content">

        {loadingFFmpeg && (
          <div className="loading-ffmpeg">
            <div className="spinner"></div>
            <p>{t('videoConverter:upload.loading')}</p>
          </div>
        )}

        {!loadingFFmpeg && !file && (
          <div 
            className="upload-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              type="file"
              id="file-input"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">🎥</div>
            <h3>{t('videoConverter:upload.title')}</h3>
            <p>{t('videoConverter:upload.subtitle')}</p>
            <p className="supported-formats">{t('videoConverter:upload.formats')}</p>
          </div>
        )}

        {file && !convertedFile && (
          <div className="conversion-panel">
            <div className="file-info">
              <div className="file-icon">🎬</div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>{formatFileSize(file.size)}</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label>{t('videoConverter:settings.outputFormat')}</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                  <optgroup label={t('videoConverter:settings.formatGroups.video')}>
                    <option value="mp4">{t('videoConverter:settings.formats.mp4')}</option>
                    <option value="webm">{t('videoConverter:settings.formats.webm')}</option>
                    <option value="avi">{t('videoConverter:settings.formats.avi')}</option>
                    <option value="mov">{t('videoConverter:settings.formats.mov')}</option>
                  </optgroup>
                  <optgroup label={t('videoConverter:settings.formatGroups.audio')}>
                    <option value="mp3">{t('videoConverter:settings.formats.mp3')}</option>
                    <option value="wav">{t('videoConverter:settings.formats.wav')}</option>
                    <option value="aac">{t('videoConverter:settings.formats.aac')}</option>
                    <option value="m4a">{t('videoConverter:settings.formats.m4a')}</option>
                    <option value="ogg">{t('videoConverter:settings.formats.ogg')}</option>
                  </optgroup>
                </select>
              </div>

              <div className="setting-group">
                <label>
                  {['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(outputFormat) 
                    ? t('videoConverter:settings.audioBitrate')
                    : t('videoConverter:settings.quality')}
                </label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="low">{t('videoConverter:settings.qualities.low')}</option>
                  <option value="medium">{t('videoConverter:settings.qualities.medium')}</option>
                  <option value="high">{t('videoConverter:settings.qualities.high')}</option>
                </select>
              </div>

              {!['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(outputFormat) && (
                <div className="setting-group">
                  <label>{t('videoConverter:settings.resolution')}</label>
                  <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                    <option value="original">{t('videoConverter:settings.resolutions.original')}</option>
                    <option value="1920:1080">{t('videoConverter:settings.resolutions.1080p')}</option>
                    <option value="1280:720">{t('videoConverter:settings.resolutions.720p')}</option>
                    <option value="854:480">{t('videoConverter:settings.resolutions.480p')}</option>
                    <option value="640:360">{t('videoConverter:settings.resolutions.360p')}</option>
                  </select>
                </div>
              )}
            </div>

            {isConverting && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="progress-text">{t('videoConverter:progress.converting')} {progress}%</p>
              </div>
            )}

            <div className="button-group">
              <button 
                className="convert-btn"
                onClick={convertVideo}
                disabled={isConverting || !ffmpegLoaded}
              >
                {isConverting ? t('videoConverter:buttons.converting') : `🔄 ${t('videoConverter:buttons.convert')}`}
              </button>
              <button 
                className="reset-btn"
                onClick={resetConverter}
                disabled={isConverting}
              >
                ❌ {t('videoConverter:buttons.cancel')}
              </button>
            </div>
          </div>
        )}

        {convertedFile && (
          <div className="result-panel">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h2>{t('videoConverter:result.success')}</h2>
            </div>

            <div className="converted-file-info">
              <div className="file-icon">🎬</div>
              <div className="file-details">
                <h3>{convertedFile.name}</h3>
                <p>{formatFileSize(convertedFile.size)}</p>
                {file && (
                  <p className="size-comparison">
                    {t('videoConverter:result.original')}: {formatFileSize(file.size)}
                    {' '}({Math.round((convertedFile.size / file.size) * 100)}% {t('videoConverter:result.ofOriginal')})
                  </p>
                )}
              </div>
            </div>

            <div className="button-group">
              <button className="download-btn" onClick={downloadFile}>
                ⬇️ {t('videoConverter:buttons.download')}
              </button>
              <button className="reset-btn" onClick={resetConverter}>
                🔄 {t('videoConverter:buttons.convertAnother')}
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="features-section">
          <h2>{t('videoConverter:features.title')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>{t('videoConverter:features.private.title')}</h3>
              <p>{t('videoConverter:features.private.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>{t('videoConverter:features.formats.title')}</h3>
              <p>{t('videoConverter:features.formats.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>{t('videoConverter:features.quality.title')}</h3>
              <p>{t('videoConverter:features.quality.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>{t('videoConverter:features.fast.title')}</h3>
              <p>{t('videoConverter:features.fast.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>{t('videoConverter:features.progress.title')}</h3>
              <p>{t('videoConverter:features.progress.description')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🆓</div>
              <h3>{t('videoConverter:features.free.title')}</h3>
              <p>{t('videoConverter:features.free.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoConverter;
