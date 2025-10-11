import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import './LegalPage.css';

function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service - Web Toolbox';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms of Service for Web Toolbox. Read our terms and conditions for using our free online tools.');
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
          <span>Terms of Service</span>
        </div>
        <h1>📜 Terms of Service</h1>
        <p className="last-updated">Last Updated: October 11, 2025</p>
      </header>

      <div className="legal-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Web Toolbox ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Web Toolbox provides free online tools including but not limited to:
          </p>
          <ul>
            <li>Image Converter (PDF, JPEG, PNG, WEBP, etc.)</li>
            <li>Audio Converter (MP3, WAV, OGG, M4A, FLAC)</li>
            <li>Video Converter (MP4, WEBM, AVI, MOV)</li>
            <li>Background Remover</li>
            <li>Color Extractor</li>
            <li>QR Code Generator</li>
            <li>Password Generator</li>
            <li>Scientific Calculator</li>
            <li>And other productivity tools</li>
          </ul>
          <p>
            All file processing is done locally in your browser. We do not upload, store, or access your files.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the Service only for lawful purposes</li>
            <li>Not use the Service to process copyrighted material without permission</li>
            <li>Not attempt to breach or test the security of the Service</li>
            <li>Not use automated tools to access the Service excessively</li>
            <li>Not reverse engineer or attempt to extract source code</li>
            <li>Not interfere with other users' access to the Service</li>
          </ul>
        </section>

        <section>
          <h2>4. Intellectual Property Rights</h2>
          <p>
            <strong>Your Content:</strong> You retain all rights to the files you process using our Service. We claim no ownership of your content.
          </p>
          <p>
            <strong>Our Content:</strong> The Service, including its design, functionality, and code, is owned by Web Toolbox and protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>5. Privacy and Data Processing</h2>
          <p>
            <strong>Local Processing:</strong> All file conversions and processing happen entirely in your browser. Your files are never uploaded to our servers.
          </p>
          <p>
            <strong>No Storage:</strong> We do not store, access, or retain any files you process using our tools.
          </p>
          <p>
            For more information, please read our <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul>
            <li>Warranties of merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Accuracy, reliability, or completeness of results</li>
          </ul>
          <p>
            We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEB TOOLBOX SHALL NOT BE LIABLE FOR ANY:
          </p>
          <ul>
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, data, use, or goodwill</li>
            <li>Service interruptions or errors</li>
            <li>Damages arising from your use or inability to use the Service</li>
          </ul>
        </section>

        <section>
          <h2>8. File Size and Usage Limits</h2>
          <p>
            While we strive to process files of various sizes, please note:
          </p>
          <ul>
            <li>Large files may cause browser performance issues</li>
            <li>Processing speed depends on your device capabilities</li>
            <li>We recommend file sizes under 500MB for optimal performance</li>
            <li>We reserve the right to implement usage limits to ensure service availability</li>
          </ul>
        </section>

        <section>
          <h2>9. Third-Party Services</h2>
          <p>
            Our Service may contain links to third-party websites or services, including:
          </p>
          <ul>
            <li>Google AdSense (advertising)</li>
            <li>CDN services (for libraries and assets)</li>
          </ul>
          <p>
            We are not responsible for the content, privacy policies, or practices of third-party services.
          </p>
        </section>

        <section>
          <h2>10. Modifications to Service</h2>
          <p>
            We reserve the right to:
          </p>
          <ul>
            <li>Modify or discontinue the Service at any time</li>
            <li>Add or remove features</li>
            <li>Change pricing (if applicable in the future)</li>
            <li>Update these Terms</li>
          </ul>
          <p>
            We will make reasonable efforts to notify users of significant changes.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to the Service immediately, without prior notice, for any reason, including but not limited to breach of these Terms.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where Web Toolbox operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>13. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or your use of the Service shall be resolved through:
          </p>
          <ul>
            <li>Good faith negotiations</li>
            <li>Mediation (if negotiations fail)</li>
            <li>Arbitration or legal proceedings (as a last resort)</li>
          </ul>
        </section>

        <section>
          <h2>14. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2>15. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:zk5minz@gmail.com">zk5minz@gmail.com</a></li>
            <li>Visit our <Link to="/contact">Contact Page</Link></li>
          </ul>
        </section>

        <div className="legal-footer">
          <p>
            By using Web Toolbox, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
