import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import './AudioConverter.css';

function AudioConverter() {
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
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      await ffmpeg.load({
        coreURL: `${window.location.origin}/ffmpeg-core.js`,
        wasmURL: `${window.location.origin}/ffmpeg-core.wasm`,
      });
      
      console.log('✅ FFmpeg loaded successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Failed to load FFmpeg:', err);
      setError('Failed to load audio processor. Please refresh the page.');
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File too large. Maximum size is 100MB.');
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
        setError('File too large. Maximum size is 100MB.');
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
      setError('Conversion failed. Please try again or use a different file.');
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
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-home-link">
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Tools</span>
          <span> &gt; </span>
          <span>Audio Converter</span>
        </div>
        <h1>🎵 Audio Converter</h1>
        <p>Convert audio files to different formats</p>
      </header>

      <div className="audio-converter-content">
        {isLoading ? (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Loading audio processor...</p>
            <p className="loading-hint">This may take a moment on first load</p>
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
                <h2>Drag & Drop your audio file here</h2>
                <p>or click to upload</p>
                <p className="upload-hint">Supports: MP3, WAV, OGG, M4A, FLAC (Max 100MB)</p>
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
                    <p>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={handleReset} className="remove-btn">
                    ✕
                  </button>
                </div>

                {/* Conversion Options */}
                <div className="conversion-options">
                  <div className="option-group">
                    <label>Output Format</label>
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
                      Quality: <span className="quality-value">{bitrate} kbps</span>
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
                      <span>Low (64)</span>
                      <span>Standard (192)</span>
                      <span>High (320)</span>
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
                      Converting... {progress}%
                    </>
                  ) : (
                    'Convert Audio'
                  )}
                </button>

                {/* Download Button */}
                {convertedFile && (
                  <button onClick={handleDownload} className="download-btn">
                    📥 Download {outputFormat.toUpperCase()}
                  </button>
                )}
              </div>
            )}

            {/* Features Section */}
            <div className="features-section">
              <h2>Why Use Our Audio Converter?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>100% Private & Secure</h3>
                  <p>All conversions happen in your browser. Your files never leave your device and are not uploaded to any server.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Fast & Efficient</h3>
                  <p>No server upload or download means faster conversion. Process your files locally without waiting in queue.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎵</div>
                  <h3>Multiple Formats</h3>
                  <p>Convert between MP3, WAV, OGG, M4A, and FLAC formats with customizable quality settings.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💾</div>
                  <h3>Free & Unlimited</h3>
                  <p>No file size limits, no conversion limits, and completely free to use. Convert as many files as you need.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔧</div>
                  <h3>Quality Control</h3>
                  <p>Adjust bitrate from 64 kbps to 320 kbps to balance between file size and audio quality.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>Works Offline</h3>
                  <p>Once loaded, the converter works completely offline. No internet connection required for conversion.</p>
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
