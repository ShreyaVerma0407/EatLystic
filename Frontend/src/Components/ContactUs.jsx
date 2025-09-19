import React, { useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

// Re-creating the icons with SVG paths to avoid external dependencies
const ArrowLeft = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M19 12H5"></path>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const Send = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const Mail = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const Phone = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2h-1.63a1.53 1.53 0 0 1-1.53-1.53v-1.63a2 2 0 0 1 2-2.18h3.11a2 2 0 0 1 2 2.18v1.63a1.53 1.53 0 0 1-1.53 1.53H22z"></path>
    <path d="M15.05 5.56a5.57 5.57 0 0 0-7.89 0"></path>
    <path d="M12.92 7.69a3 3 0 0 0-4.24 0"></path>
    <path d="M17.18 3.44a8 8 0 0 0-11.31 0"></path>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2h-1.63a1.53 1.53 0 0 1-1.53-1.53v-1.63a2 2 0 0 1 2-2.18h3.11a2 2 0 0 1 2 2.18v1.63a1.53 1.53 0 0 1-1.53 1.53H22z"></path>
  </svg>
);

const Clock = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const MapPin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M12 21.7C17.3 17 22 13 22 8c0-5-4-9-10-9S2 3 2 8c0 5 4.7 9 10 13.7z"></path>
    <circle cx="12" cy="8" r="3"></circle>
  </svg>
);

// A simple toast-like notification component
const Toast = ({ message, visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="toast-container">
      <div className="toast-message">
        <h3 style={{ fontWeight: 'bold' }}>Message Sent Successfully!</h3>
        <p>We'll get back to you within 24 hours.</p>
      </div>
      <button onClick={onClose} className="toast-close-button">
        &times;
      </button>
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #333;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
        }
        .toast-close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// A simple Card-like component
const Card = ({ children, className }) => {
  return (
    <div className={`card ${className}`}>
      {children}
      <style jsx>{`
        .card {
          background-color: #262626;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #ffffff; /* White border */
        }
      `}</style>
    </div>
  );
};

<Navbar />

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    issueType: 'general',
  });

  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000); // Hide toast after 5 seconds

    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      issueType: 'general',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/helpdesk'); // Navigate to /helpdesk
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <div className="gradient-orange-dark p-6">
        <div className="max-w-6xl mx-auto">
          <button className="back-button" onClick={handleBackClick}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Help Desk
    </button>
          <h1 className="text-6xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-white-90 text-2xl">
            Report an issue or get in touch with our support team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Issue Reporting Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-yellow-500">Report an Issue</h2>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <input
                      className="input-field"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      className="input-field"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issue Type</label>
                  <select
                    className="select-field"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="delivery">Delivery Issue</option>
                    <option value="app">App/Technical Issue</option>
                    <option value="restaurant">Restaurant Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    className="input-field"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    className="input-field"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                  />
                </div>

                <button type="submit" className="submit-button">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-yellow-500">Get in Touch</h2>
            <div className="space-y-6">
            <Card>
  <div className="flex items-start space-x-4">
    <div className="icon-circle">
      <Mail className="w-6 h-6 text-orange-medium" />
    </div>
    <div>
      <h3 className="font-semibold mb-1 text-white">Email Support</h3>
      <p className="text-white mb-2">Get help via email</p>
      <p className="text-white font-medium">support@eatlystic.com</p>
    </div>
  </div>
</Card>

<Card>
  <div className="flex items-start space-x-4">
    <div className="icon-circle">
      <Phone className="w-6 h-6 text-orange-medium" />
    </div>
    <div>
      <h3 className="font-semibold mb-1 text-white">Phone Support</h3>
      <p className="text-white mb-2">Talk to our support team</p>
      <p className="text-white font-medium">+1 (555) 123-4567</p>
    </div>
  </div>
</Card>

<Card>
  <div className="flex items-start space-x-4">
    <div className="icon-circle">
      <Clock className="w-6 h-6 text-orange-medium" />
    </div>
    <div>
      <h3 className="font-semibold mb-1 text-white">Support Hours</h3>
      <p className="text-white mb-2">We're here to help</p>
      <div className="text-sm text-white">
        <p>Monday - Friday: 9:00 AM - 9:00 PM</p>
        <p>Saturday - Sunday: 10:00 AM - 6:00 PM</p>
      </div>
    </div>
  </div>
</Card>

            </div>
          </div>
        </div>
      </div>

      <Toast message="Message Sent Successfully!" visible={toastVisible} onClose={() => setToastVisible(false)} />

      {/* CSS-in-JS for styling */}
      <style jsx>{`
        .min-h-screen { min-height: 100vh; }
        .bg-background { background-color: #111111; }
        .text-foreground { color: #f0f0f0; }
        .gradient-orange-dark {
          background: linear-gradient(to right, #000000ff, #b54b04ff);
          color: white;
        }
        .p-6 { padding: 24px; }
        .max-w-6xl { max-width: 1152px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-4 { margin-bottom: 16px; }
        .mb-2 { margin-bottom: 8px; }
        .text-6xl { font-size: 48px; }
        .font-bold { font-weight: 700; }
        .text-white { color: #fff; }
        .text-white-90 { color: rgba(255, 255, 255, 0.9); }
        .grid { display: grid; }
        .lg\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 1024px) {
          .lg\\:grid-cols-2 { grid-template-columns: 1fr; }
        }
        .gap-8 { gap: 32px; }
        .text-2xl { font-size: 24px; }
        .font-semibold { font-weight: 600; }
        .mb-6 { margin-bottom: 24px; }
        .text-yellow-500 { color: #ffeb3b; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .grid.md:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 768px) {
          .grid.md\\:grid-cols-2 { grid-template-columns: 1fr; }
        }
        .gap-4 { gap: 16px; }
        .block { display: block; }
        .text-sm { font-size: 14px; }
        .font-medium { font-weight: 500; }
        .back-button {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: transparent;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .back-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .input-field {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ffffff;
          background-color: #1f1f1f;
          color: #fff;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #ff5500;
        }
        .select-field {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ffffff;
          background-color: #1f1f1f;
          color: #fff;
          cursor: pointer;
        }
        .submit-button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          background-color: #ff5500;
          color: white;
          border: none;
          transition: background-color 0.2s;
        }
        .submit-button:hover {
          background-color: #e64d00;
        }
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .space-x-4 > * + * { margin-left: 16px; }
        .icon-circle {
          background-color: #333333;
          padding: 12px;
          border-radius: 9999px;
        }
        .w-6 { width: 24px; }
        .h-6 { height: 24px; }
        .w-4 { width: 16px; }
        .h-4 { height: 16px; }
        .mr-2 { margin-right: 8px; }
        .text-orange-medium { color: #ff5500; }
        .text-orange-light { color: #ffab40; }
        .text-muted-foreground { color: #a1a1aa; }
      `}</style>
    </div>
  );
}
