import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './VideoConverter.css';

function VideoConverter() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
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
    document.title = 'Free Video Converter - MP4, WEBM, AVI, MOV | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert video files between MP4, WEBM, AVI, and MOV formats. Free online video converter with resolution and quality control. 100% private, browser-based.');
    }
  }, []);

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
    
    // Quality settings
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
      const blob = new Blob([data.buffer], { type: `video/${outputFormat}` });
      
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
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-home-link">
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Tools</span>
          <span> &gt; </span>
          <span>Video Converter</span>
        </div>
        <h1>🎬 Video Converter</h1>
        <p>Convert video files to different formats</p>
      </header>

      <div className="video-converter-content">

        {loadingFFmpeg && (
          <div className="loading-ffmpeg">
            <div className="spinner"></div>
            <p>Loading video converter...</p>
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
            <h3>Drag & Drop your video file here</h3>
            <p>or click to upload</p>
            <p className="supported-formats">Supports: MP4, AVI, MOV, MKV, WEBM, FLV, WMV (Max 500MB)</p>
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
                <label>Output Format</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WEBM (VP9)</option>
                  <option value="avi">AVI (MPEG-4)</option>
                  <option value="mov">MOV (QuickTime)</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Quality</label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="low">Low (Smaller file)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Better quality)</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Resolution</label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                  <option value="original">Original</option>
                  <option value="1920:1080">1080p (1920x1080)</option>
                  <option value="1280:720">720p (1280x720)</option>
                  <option value="854:480">480p (854x480)</option>
                  <option value="640:360">360p (640x360)</option>
                </select>
              </div>
            </div>

            {isConverting && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="progress-text">Converting... {progress}%</p>
              </div>
            )}

            <div className="button-group">
              <button 
                className="convert-btn"
                onClick={convertVideo}
                disabled={isConverting || !ffmpegLoaded}
              >
                {isConverting ? 'Converting...' : '🔄 Convert Video'}
              </button>
              <button 
                className="reset-btn"
                onClick={resetConverter}
                disabled={isConverting}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {convertedFile && (
          <div className="result-panel">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h2>Conversion Complete!</h2>
            </div>

            <div className="converted-file-info">
              <div className="file-icon">🎬</div>
              <div className="file-details">
                <h3>{convertedFile.name}</h3>
                <p>{formatFileSize(convertedFile.size)}</p>
                {file && (
                  <p className="size-comparison">
                    Original: {formatFileSize(file.size)}
                    {' '}({Math.round((convertedFile.size / file.size) * 100)}% of original)
                  </p>
                )}
              </div>
            </div>

            <div className="button-group">
              <button className="download-btn" onClick={downloadFile}>
                ⬇️ Download Video
              </button>
              <button className="reset-btn" onClick={resetConverter}>
                🔄 Convert Another
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="features-section">
          <h2>Why Use Our Video Converter?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>100% Private & Secure</h3>
              <p>All video conversion happens locally in your browser. Your videos never leave your device and are not uploaded to any server.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>Multiple Formats</h3>
              <p>Convert between MP4, WEBM, AVI, and MOV formats. Support for all major video codecs and containers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Quality Control</h3>
              <p>Choose quality settings and resolution. Optimize for file size or video quality based on your needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Conversion</h3>
              <p>Powered by FFmpeg WebAssembly for fast, efficient video processing directly in your browser.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-Time Progress</h3>
              <p>See conversion progress in real-time with detailed progress indicators and estimated time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🆓</div>
              <h3>100% Free Forever</h3>
              <p>No watermarks, no limits. Convert unlimited videos with all features completely free.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoConverter;
