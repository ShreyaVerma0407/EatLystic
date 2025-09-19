import React from 'react';
import Navbar from './Navbar'; // Assuming Navbar component is in the same directory

// Icons as basic SVG components
const MessageCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M7.9 20A9.3 9.3 0 0 1 4 16.1L2 22l6-2zm12.1-12a9.3 9.3 0 0 1-4.1 4.1L12 18l-6-2.1A9.3 9.3 0 0 1 8 4a9.3 9.3 0 0 1 12 4z"></path>
  </svg>
);

const HelpCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.86 1c.21 2-.15 4-2.15 4"></path>
    <line x1="12" y1="17" x2="12" y2="17"></line>
  </svg>
);

const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const HelpDesk = () => {
  const Card = ({ title, description, icon: Icon, isGradient = false }) => {
    return (
      <div
        className={`card ${isGradient ? 'card-gradient' : ''}`}
        style={{
          '--card-border-color': isGradient ? 'transparent' : 'rgba(255, 152, 0, 0.3)',
          '--card-hover-border-color': isGradient ? 'transparent' : 'rgba(255, 152, 0, 0.6)',
          '--icon-bg-color': 'rgba(255, 152, 0, 0.2)',
          '--icon-color': '#ff9800',
          '--text-color': '#c9d1d9',
          '--button-bg-color': '#ff9800',
          '--button-hover-bg-color': '#e68a00',
        }}
      >
        <div className="card-inner-container">
          <div className="icon-circle">
            <Icon className="icon-style" />
          </div>
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
          <button className="card-button">Get Started</button>
        </div>
      </div>
    );
  };

  return (
    <div className="help-center-page">
      <Navbar />

      <div className="header-section">
        <h1>Eatlystic Help Center</h1>
        <p>Get the support you need. We're here to help with any questions, issues, or feedback you may have.</p>
      </div>

      <div className="cards-section">
        <Card
          title="Contact Us"
          description="Report an issue or get help from our support team"
          icon={MessageCircle}
        />
        <Card
          title="FAQ"
          description="Find quick answers to frequently asked questions"
          icon={HelpCircle}
        />
        <Card
          title="Feedback"
          description="Share your experience and read customer reviews"
          icon={FileText}
        />
      </div>

      <div className="footer-section">
        <h3>Need Immediate Help?</h3>
        <p>For urgent issues, you can reach our support team directly at <a href="mailto:support@eatlystic.com">support@eatlystic.com</a> </p>
        
      </div>
      
      {/* CSS-in-JS for styling */}
      <style jsx>{`
        .help-center-page {
          background-color: #181824;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          min-height: 100vh; /* Ensure the container is at least the height of the viewport */
          display: flex;
          flex-direction: column;
        }

        .header-section {
          background: linear-gradient(to right, #000000ff, #b54b04ff); /* Orange gradient */
          text-align: center;
          padding: 40px 20px;
        }

        .header-section h1 {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .header-section p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .cards-section {
          background-color: #2c2c2c;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
          flex-grow: 1; /* Allow cards section to take up available space */
        }

        .card {
          background-color: #2c2c2c;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          max-width: 350px;
          flex: 1;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          border: 2px solid var(--card-border-color);
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          border-color: var(--card-hover-border-color);
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          background-color: var(--icon-bg-color);
        }

        .icon-style {
          width: 32px;
          height: 32px;
          color: var(--icon-color);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--text-color);
        }

        .card-description {
          font-size: 0.9rem;
          margin-bottom: 20px;
          color: var(--text-color);
        }

        .card-button {
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.3s ease;
          color: #fff;
          background-color: var(--button-bg-color);
        }

        .card-button:hover {
          background-color: var(--button-hover-bg-color);
        }

        .footer-section {
          background-color: #181824;
          text-align: center;
          padding: 40px 20px;
          margin-top: auto; /* Pushes the footer to the bottom */
        }

        .footer-section h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #ff9800;
        }

        .footer-section p {
          font-size: 0.95rem;
          color: #ccc;
          margin-bottom: 5px;
        }

        .footer-section a {
          color: #ff9800;
          text-decoration: none;
          font-weight: 600;
        }

        .footer-section a:hover {
          text-decoration: underline;
        }

        .hours {
          margin-top: 20px;
          font-size: 0.85rem;
          color: #888;
        }

        @media (max-width: 768px) {
          .cards-section {
            flex-direction: column;
            align-items: center;
          }
          .card {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpDesk;