import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import './LegalPage.css';

function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Web Toolbox';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Web Toolbox. Learn how we protect your data and respect your privacy.');
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
          <span>Privacy Policy</span>
        </div>
        <h1>🔒 Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 11, 2025</p>
      </header>

      <div className="legal-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Web Toolbox ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our website and services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <p>
            <strong>Local Processing Only:</strong> All files you upload (images, audio, video, PDFs) are processed entirely in your browser. We do not collect, store, or transmit these files to our servers.
          </p>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> We may collect information about how you interact with our website, including pages visited, tools used, and time spent.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
            <li><strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information for the following purposes:</p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To improve user experience and website functionality</li>
            <li>To analyze usage patterns and trends</li>
            <li>To display relevant advertisements (via Google AdSense)</li>
            <li>To communicate with you about updates and changes</li>
          </ul>
        </section>

        <section>
          <h2>4. Google AdSense and Third-Party Advertising</h2>
          <p>
            We use Google AdSense to display advertisements on our website. Google AdSense may use cookies and web beacons to collect information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
          </p>
          
          <h3>Third-Party Cookies</h3>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>.
          </p>
        </section>

        <section>
          <h2>5. Data Security and Privacy</h2>
          <p>
            <strong>Client-Side Processing:</strong> Our core tools (image converter, audio converter, video converter, background remover) process all files directly in your browser using WebAssembly technology. Your files never leave your device.
          </p>
          <p>
            <strong>No File Storage:</strong> We do not store, access, or transmit any files you process using our tools.
          </p>
          <p>
            <strong>Security Measures:</strong> We implement industry-standard security measures to protect your data, including HTTPS encryption for all communications.
          </p>
        </section>

        <section>
          <h2>6. Cookies and Tracking Technologies</h2>
          <p>We use the following types of cookies:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for website functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Advertising Cookies:</strong> Used by Google AdSense to serve relevant ads</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of personalized advertising</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:zk5minz@gmail.com">zk5minz@gmail.com</a></li>
            <li>Visit our <Link to="/contact">Contact Page</Link></li>
          </ul>
        </section>

        <section>
          <h2>11. International Users</h2>
          <p>
            If you are accessing our services from outside your country, please note that your information may be transferred to, stored, and processed in different countries. By using our services, you consent to such transfers.
          </p>
        </section>

        <div className="legal-footer">
          <p>
            By using Web Toolbox, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
