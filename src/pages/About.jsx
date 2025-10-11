import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import './LegalPage.css';

function About() {
  useEffect(() => {
    document.title = 'About Us - Web Toolbox';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Web Toolbox - your free online toolkit for image, audio, video conversion and more. 100% private and browser-based.');
    }
  }, []);

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-home-link">
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>About Us</span>
        </div>
        <h1>ℹ️ About Web Toolbox</h1>
        <p className="tagline">Your Free, Private, Browser-Based Toolkit</p>
      </header>

      <div className="legal-content">
        <section>
          <h2>🎯 Our Mission</h2>
          <p>
            Web Toolbox was created with a simple mission: to provide powerful, free online tools that respect your privacy. We believe that everyone should have access to professional-grade tools without compromising their data security or paying subscription fees.
          </p>
        </section>

        <section>
          <h2>🔒 Privacy First</h2>
          <p>
            Unlike many online tools, <strong>all processing happens directly in your browser</strong>. This means:
          </p>
          <ul>
            <li>✅ Your files never leave your device</li>
            <li>✅ No server uploads or downloads</li>
            <li>✅ Complete privacy and security</li>
            <li>✅ Works offline once loaded</li>
            <li>✅ No file size limits from server restrictions</li>
          </ul>
          <p>
            We use cutting-edge WebAssembly technology to bring desktop-quality processing to your browser.
          </p>
        </section>

        <section>
          <h2>🛠️ What We Offer</h2>
          <div className="tools-grid">
            <div className="tool-category">
              <h3>🖼️ Media Converters</h3>
              <ul>
                <li>Image Converter (PDF, JPEG, PNG, WEBP)</li>
                <li>Audio Converter (MP3, WAV, OGG, M4A, FLAC)</li>
                <li>Video Converter (MP4, WEBM, AVI, MOV)</li>
              </ul>
            </div>

            <div className="tool-category">
              <h3>🎨 Creative Tools</h3>
              <ul>
                <li>Background Remover (AI-powered)</li>
                <li>Color Extractor from Images</li>
                <li>QR Code Generator</li>
              </ul>
            </div>

            <div className="tool-category">
              <h3>🔧 Utilities</h3>
              <ul>
                <li>Password Generator</li>
                <li>Scientific Calculator</li>
                <li>Character Counter</li>
                <li>Number Counter</li>
                <li>Stopwatch & Timer</li>
                <li>World Clock</li>
                <li>Online Notepad</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2>💡 Why Choose Us?</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>🆓 100% Free</h3>
              <p>No hidden fees, no subscriptions, no premium tiers. All features are free forever.</p>
            </div>

            <div className="feature-item">
              <h3>🔐 Privacy Guaranteed</h3>
              <p>Client-side processing means your data never touches our servers. Your files stay on your device.</p>
            </div>

            <div className="feature-item">
              <h3>⚡ Fast & Efficient</h3>
              <p>No server uploads mean faster processing. Convert files in seconds, not minutes.</p>
            </div>

            <div className="feature-item">
              <h3>🌐 Works Offline</h3>
              <p>Once loaded, most tools work without an internet connection.</p>
            </div>

            <div className="feature-item">
              <h3>📱 Any Device</h3>
              <p>Works on desktop, tablet, and mobile browsers. No installation required.</p>
            </div>

            <div className="feature-item">
              <h3>🔄 Always Updated</h3>
              <p>We continuously add new tools and improve existing ones based on user feedback.</p>
            </div>
          </div>
        </section>

        <section>
          <h2>🔬 Technology</h2>
          <p>
            Web Toolbox leverages modern web technologies to deliver powerful functionality:
          </p>
          <ul>
            <li><strong>WebAssembly (WASM):</strong> Near-native performance in the browser</li>
            <li><strong>FFmpeg:</strong> Industry-standard media processing</li>
            <li><strong>ONNX Runtime:</strong> AI-powered features like background removal</li>
            <li><strong>React:</strong> Smooth, responsive user interface</li>
            <li><strong>Service Workers:</strong> Offline functionality</li>
          </ul>
        </section>

        <section>
          <h2>🌍 Our Values</h2>
          <div className="values-list">
            <p><strong>🔒 Privacy:</strong> Your data belongs to you. We never collect, store, or access your files.</p>
            <p><strong>🆓 Accessibility:</strong> Powerful tools should be free and available to everyone.</p>
            <p><strong>⚡ Performance:</strong> We optimize for speed without compromising quality.</p>
            <p><strong>🎨 Simplicity:</strong> Intuitive interfaces that anyone can use.</p>
            <p><strong>🌱 Sustainability:</strong> Client-side processing reduces server load and energy consumption.</p>
          </div>
        </section>

        <section>
          <h2>📈 Future Plans</h2>
          <p>
            We're constantly working to improve Web Toolbox. Upcoming features include:
          </p>
          <ul>
            <li>🌐 Multi-language support</li>
            <li>🔧 More conversion formats and options</li>
            <li>🎨 Additional creative tools</li>
            <li>📱 Progressive Web App (PWA) for offline use</li>
            <li>⚙️ Batch processing capabilities</li>
            <li>🤖 More AI-powered features</li>
          </ul>
        </section>

        <section>
          <h2>💬 Feedback & Support</h2>
          <p>
            We love hearing from our users! Whether you have:
          </p>
          <ul>
            <li>Feature requests</li>
            <li>Bug reports</li>
            <li>General feedback</li>
            <li>Questions or concerns</li>
          </ul>
          <p>
            Please don't hesitate to <Link to="/contact">contact us</Link>. Your input helps us make Web Toolbox better for everyone.
          </p>
        </section>

        <section>
          <h2>🤝 Community</h2>
          <p>
            Web Toolbox is built for the community. We believe in:
          </p>
          <ul>
            <li>Transparency in our operations</li>
            <li>Open communication with users</li>
            <li>Continuous improvement based on feedback</li>
            <li>Creating tools that solve real problems</li>
          </ul>
        </section>

        <section>
          <h2>📞 Get in Touch</h2>
          <p>
            Have questions or want to learn more?
          </p>
          <ul>
            <li>Email: <a href="mailto:contact@web-toolbox.com">contact@web-toolbox.com</a></li>
            <li>Visit our <Link to="/contact">Contact Page</Link></li>
          </ul>
        </section>

        <div className="legal-footer">
          <p>
            Thank you for choosing Web Toolbox. We're committed to providing you with the best free online tools while respecting your privacy and security.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
