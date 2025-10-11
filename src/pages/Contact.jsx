import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './LegalPage.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us - Web Toolbox';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact Web Toolbox. Send us your feedback, questions, or feature requests.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const mailtoLink = `mailto:zk5minz@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    window.location.href = mailtoLink;
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-home-link">
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Contact Us</span>
        </div>
        <h1>📧 Contact Us</h1>
        <p className="tagline">We'd love to hear from you!</p>
      </header>

      <div className="legal-content">
        <section>
          <h2>Get in Touch</h2>
          <p>
            Have a question, suggestion, or feedback? We're here to help! Please fill out the form below or reach out to us directly.
          </p>
        </section>

        <div className="contact-methods">
          <div className="contact-method">
            <div className="contact-icon">📧</div>
            <h3>Email</h3>
            <p>
              <a href="mailto:zk5minz@gmail.com">zk5minz@gmail.com</a>
            </p>
            <p className="contact-description">
              For general inquiries, feedback, or support
            </p>
          </div>

          <div className="contact-method">
            <div className="contact-icon">💬</div>
            <h3>Feedback</h3>
            <p>We value your input!</p>
            <p className="contact-description">
              Share your ideas for new features or improvements
            </p>
          </div>

          <div className="contact-method">
            <div className="contact-icon">🐛</div>
            <h3>Bug Reports</h3>
            <p>Found an issue?</p>
            <p className="contact-description">
              Help us improve by reporting bugs or problems
            </p>
          </div>
        </div>

        <section className="contact-form-section">
          <h2>Send Us a Message</h2>
          
          {submitted && (
            <div className="success-message">
              ✅ Thank you! Your email client will open with your message.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject...</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feedback">Feedback</option>
                <option value="Support">Technical Support</option>
                <option value="Privacy Concern">Privacy Concern</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us what's on your mind..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              📤 Send Message
            </button>
          </form>
        </section>

        <section>
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>❓ Are my files safe and private?</h3>
            <p>
              Yes! All file processing happens in your browser. Your files never leave your device and are not uploaded to any server. Read our <Link to="/privacy-policy">Privacy Policy</Link> for more details.
            </p>
          </div>

          <div className="faq-item">
            <h3>❓ Is Web Toolbox really free?</h3>
            <p>
              Absolutely! All tools are 100% free with no hidden costs, subscriptions, or premium tiers. We support the service through non-intrusive advertising.
            </p>
          </div>

          <div className="faq-item">
            <h3>❓ Can I suggest new features?</h3>
            <p>
              Yes, we'd love to hear your ideas! Use the contact form above with "Feature Request" as the subject, or email us directly at <a href="mailto:contact@web-toolbox.com">contact@web-toolbox.com</a>.
            </p>
          </div>

          <div className="faq-item">
            <h3>❓ I found a bug. How do I report it?</h3>
            <p>
              Thank you for helping us improve! Please use the contact form with "Bug Report" as the subject, or email us at <a href="mailto:zk5minz@gmail.com">zk5minz@gmail.com</a> and include:
            </p>
            <ul>
              <li>What tool you were using</li>
              <li>What you were trying to do</li>
              <li>What happened vs. what you expected</li>
              <li>Your browser and device information</li>
            </ul>
          </div>

          <div className="faq-item">
            <h3>❓ Do you offer business or API services?</h3>
            <p>
              Currently, Web Toolbox is designed for individual use. If you're interested in business solutions or API access, please contact us to discuss your needs.
            </p>
          </div>

          <div className="faq-item">
            <h3>❓ How can I support Web Toolbox?</h3>
            <p>
              The best way to support us is by:
            </p>
            <ul>
              <li>Sharing Web Toolbox with friends and colleagues</li>
              <li>Leaving feedback to help us improve</li>
              <li>Allowing non-intrusive ads on our site</li>
              <li>Following us on social media (coming soon!)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>Response Time</h2>
          <p>
            We strive to respond to all inquiries within <strong>24-48 hours</strong> during business days. For urgent matters, please mention "URGENT" in your subject line.
          </p>
          <p>
            Please note: We're a small team, so response times may vary. Thank you for your patience!
          </p>
        </section>

        <div className="legal-footer">
          <p>
            Thank you for reaching out! We appreciate your interest in Web Toolbox and look forward to hearing from you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
