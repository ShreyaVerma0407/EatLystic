import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
// --- Placeholder Components (since they are not provided) ---

<Navbar/>

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

// A simple toast-like notification component
const Toast = ({ visible, onClose }) => {
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
      {/* Toast specific styles */}
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #181824; /* Dark for contrast */
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
      {/* Card specific styles */}
      <style jsx>{`
        .card {
          max-width: 500px;
          background-color: #fff7e6; /* Pale orange/Near white (REPLACING GREY/DARK) */
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #ff9800; /* Medium Orange */
          color: #181824; /* Dark text */
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NOTE: Using a mock endpoint. This will likely fail in the Canvas environment.
      // We will only mock success for the UI demonstration.
      console.log('Form Submitted:', formData);
      
      // MOCK API SUCCESS for demonstration
      await new Promise(resolve => setTimeout(resolve, 500)); 

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000); // Hide toast after 5 seconds
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // WARNING: 'useNavigate' only works if this component is wrapped in a React Router setup.
  // Assuming 'useNavigate' is available in the environment:
  let navigate;
  try {
      navigate = useNavigate();
  } catch (e) {
      // Fallback for environments without React Router (like the Canvas Preview)
      navigate = (to) => {
          console.warn(`Simulating navigation to: ${to}. Install react-router-dom to enable full functionality.`);
          window.location.href = to;
      };
  }

  const handleBackClick = () => {
    navigate('/helpdesk'); // Navigate to /helpdesk
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar Placeholder */}
      <Navbar />

      {/* Header Section */}
      <div className="gradient-orange-header p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back button text is now ORANGE, background is transparent */}
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
            {/* Header text is now Dark/Black for contrast */}
            <h2 className="text-2xl font-semibold mb-6 text-primary-dark">Report an Issue</h2>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    {/* Label is now Dark */}
                    <label className="block text-sm font-medium mb-2 text-primary-dark">Your Name *</label>
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
                    {/* Label is now Dark */}
                    <label className="block text-sm font-medium mb-2 text-primary-dark">Email Address *</label>
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
                  {/* Label is now Dark */}
                  <label className="block text-sm font-medium mb-2 text-primary-dark">Subject *</label>
                  <input
                    className="input-field"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Subject/Title:"
                  />
                </div>

                <div>
                  {/* Label is now Dark */}
                  <label className="block text-sm font-medium mb-2 text-primary-dark">Message *</label>
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
            {/* Header text is now Dark/Black for contrast */}
            <h2 className="text-2xl font-semibold mb-6 text-primary-dark">Get in Touch</h2>
            <div className="space-y-6">
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="icon-circle">
                    <Mail className="w-6 h-6 text-orange-medium" />
                  </div>
                  <div>
                    {/* Text is now Dark/Black. The inner text that was white is now ORANGE */}
                    <h3 className="font-semibold mb-1 text-primary-dark">Email Support</h3>
                    <p className="text-primary-dark mb-2">Get help via email</p>
                    <p className="text-light-orange font-medium">support@eatlystic.com</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="icon-circle">
                    <Phone className="w-6 h-6 text-orange-medium" />
                  </div>
                  <div>
                    {/* Text is now Dark/Black. The inner text that was white is now ORANGE */}
                    <h3 className="font-semibold mb-1 text-primary-dark">Phone Support</h3>
                    <p className="text-primary-dark mb-2">Talk to our support team</p>
                    <p className="text-light-orange font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="icon-circle">
                    <Clock className="w-6 h-6 text-orange-medium" />
                  </div>
                  <div>
                    {/* Text is now Dark/Black. The inner text that was white is now ORANGE */}
                    <h3 className="font-semibold mb-1 text-primary-dark">Support Hours</h3>
                    <p className="text-primary-dark mb-2">We're here to help</p>
                    <div className="text-sm text-light-orange">
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

      <Toast visible={toastVisible} onClose={() => setToastVisible(false)} />
      <Footer />
      
      {/* CSS-in-JS for styling */}
      <style jsx>{`
        /* --- Color Variables --- */
        .bg-background { background-color: #ffe0b2; } /* Light Orange BG (REPLACING BLACK) */
        .text-foreground { color: #181824; } /* Deep Brown/Black Text (REPLACING GREY/F0F0F0) */
        .text-primary-dark { color: #181824; } /* Dark Text */
        .text-light-orange { color: #ff5500; } /* Vibrant Orange Text (REPLACING WHITE/YELLOW) */
        .orange-medium { color: #ff9800; }

        /* Header Gradient (Kept dark enough for white text) */
        .gradient-orange-header {
          background: linear-gradient(to right, #e64d00, #ff8a3d);
          color: white;
        }

        /* --- Layout & General Styles --- */
        .min-h-screen { min-height: 100vh; }
        .p-6 { padding: 24px; }
        .max-w-6xl { max-width: 1152px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
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

        /* Back Button Style */
        .back-button {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
          margin-bottom: 20px;
        }
        .back-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: #fff;
        }

        /* Input Field Style */
        .input-field {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ff9800; /* Medium Orange Border (REPLACING WHITE) */
          background-color: #fff; /* White background for input (REPLACING DARK) */
          color: #181824; /* Dark text (REPLACING WHITE) */
          transition: border-color 0.2s;
        }
        .input-field::placeholder {
            color: #777;
        }
        .input-field:focus {
          outline: none;
          border-color: #ff5500;
        }
        
        /* Submit Button Style */
        .submit-button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          background-color: #ff5500; /* Primary Orange */
          color: white;
          border: none;
          transition: background-color 0.2s;
        }
        .submit-button:hover {
          background-color: #e64d00;
        }

        /* Contact Info Card Styles */
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .space-x-4 > * + * { margin-left: 16px; }
        .icon-circle {
          background-color: #fff0d9; /* Very Pale Orange (REPLACING DARK #333) */
          padding: 12px;
          border-radius: 9999px;
        }
        .w-6 { width: 24px; }
        .h-6 { height: 24px; }
        .w-4 { width: 16px; }
        .h-4 { height: 16px; }
        .mr-2 { margin-right: 8px; }
        .text-orange-medium { color: #ff5500; }
        .bg-pale-orange-darker { background-color: #ff9800; }
        
        /* Footer Placeholder Styles */
        .footer-placeholder { 
            font-family: 'Inter', sans-serif;
            font-size: 0.85rem;
            color: #181824; 
        }
        .navbar-placeholder {
            background-color: #ffe0b2;
        }

      `}</style>
    </div>
  );
}
