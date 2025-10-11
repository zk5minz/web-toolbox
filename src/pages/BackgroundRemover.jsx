import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemover = () => {
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
      setError('File size too large. Maximum 10MB.');
      return;
    }

    // Format check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WEBP.');
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
      setError('Failed to remove background. Please try again.');
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '48px 16px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        paddingLeft: '16px',
        paddingRight: '16px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '18px'
        }}>
          <Link
            to="/"
            style={{
              background: 'white',
              color: '#6366f1',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'underline',
              fontWeight: 700,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1e40af';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#6366f1';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏠 Home
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{'>'}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Background Remover</span>
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'white',
          marginBottom: '8px'
        }}>
          🪄 Background Remover
        </h1>
        <p style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'white'
        }}>
          Remove image backgrounds automatically with AI
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* Main Content Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          minHeight: '400px'
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontWeight: 700,
              textAlign: 'center',
              border: '2px solid #ef5350'
            }}>
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
                style={{
                  border: '3px dashed #2196F3',
                  borderRadius: '16px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e3f2fd';
                  e.currentTarget.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#2196F3';
                }}
              >
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>📤</div>
                <h3 style={{ fontWeight: 700, marginBottom: '10px', fontSize: '28px', color: '#333' }}>
                  Drag & Drop your image here
                </h3>
                <p style={{ fontWeight: 700, color: '#666', fontSize: '18px', marginBottom: '10px' }}>or click to upload</p>
                <p style={{ fontWeight: 700, color: '#999', fontSize: '16px', marginTop: '10px' }}>
                  Supports: JPG, PNG, WEBP (Max 10MB)
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
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '8px solid #f3f3f3',
                borderTop: '8px solid #2196F3',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 30px'
              }}></div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '10px'
              }}>
                Removing background...
              </h3>
              <p style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#666'
              }}>
                This may take a few moments
              </p>
            </div>
          )}

          {/* Results */}
          {processedImage && !isProcessing && (
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '30px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <span>✨</span>
                <span>Background Removed Successfully!</span>
              </h2>

              {/* Before/After Comparison */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {/* Original */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#333',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    Before
                  </h3>
                  <div style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '10px',
                    background: 'white',
                    textAlign: 'center'
                  }}>
                    <img
                      src={originalImage}
                      alt="Original"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </div>

                {/* Processed */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#333',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    After
                  </h3>
                  <div style={{
                    border: '2px solid #4CAF50',
                    borderRadius: '12px',
                    padding: '10px',
                    backgroundImage: `
                      linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                      linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    textAlign: 'center'
                  }}>
                    <img
                      src={processedImage}
                      alt="Background Removed"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    padding: '20px 40px',
                    fontSize: '20px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#45a049';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#4CAF50';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  ⬇️ Download PNG
                </button>

                <button
                  onClick={resetAll}
                  style={{
                    background: '#757575',
                    color: 'white',
                    padding: '20px 40px',
                    fontSize: '18px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#616161';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#757575';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  🔄 Try Another Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: '2rem' }}>Why Use Our Background Remover?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>100% Private & Secure</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>All processing happens locally in your browser using AI. Your images never leave your device and are not uploaded to any server.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>AI-Powered Precision</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>Advanced AI technology automatically detects and removes backgrounds with high accuracy, even for complex images.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>Instant Results</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>Fast background removal in seconds. No waiting, no complicated settings, just upload and get results.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>Transparent PNG Output</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>Download high-quality PNG images with transparent backgrounds, perfect for design and marketing.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📱</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>Works Anywhere</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>Fully responsive design works on desktop, tablet, and mobile. Remove backgrounds from any device.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🆓</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>100% Free Forever</h3>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>No watermarks, no limits. Remove backgrounds from unlimited images completely free.</p>
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
