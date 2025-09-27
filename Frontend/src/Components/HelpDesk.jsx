import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar'; 
// FIX: Import the new external CSS file
import '../styles/HelpDesk.css'; 

// --- Color Constants for Inline Styles ---
const primaryOrange = '#ff9800';
const lightOrange = '#ffe0b2'; 
const darkOrange = '#e65100';
const darkText = '#181824';
const buttonHover = '#e68a00'; // slightly darker for hover

// Icons as basic SVG components (Unchanged)
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
  const navigate = useNavigate(); 

  const Card = ({ title, description, icon: Icon, isGradient = false, to }) => {
    const handleClick = () => {
      navigate(to); 
    };

    // FIX: Use inline styles only for dynamic CSS properties that were previously vars
    // Note: The border property is applied inline to override the default transparent border
    // and correctly apply the border color from the JS constants.
    const cardStyles = {
        backgroundColor: lightOrange,
        border: `2px solid ${isGradient ? 'transparent' : 'rgba(230, 81, 0, 0.3)'}`
    };

    const iconCircleStyles = {
        backgroundColor: 'rgba(230, 81, 0, 0.1)',
    };
    
    const iconStyles = {
        color: primaryOrange
    };
    
    const textStyles = {
        color: darkText
    };

    const buttonStyles = {
        color: '#fff',
        backgroundColor: primaryOrange,
    };
    
    return (
      <div
        className={`card ${isGradient ? 'card-gradient' : ''}`}
        // Apply card-specific styles here
        style={cardStyles}
      >
        <div className="card-inner-container">
          <div className="icon-circle" style={iconCircleStyles}>
            <Icon className="icon-style" style={iconStyles} />
          </div>
          <h3 className="card-title" style={textStyles}>{title}</h3>
          <p className="card-description" style={textStyles}>{description}</p>
          <button className="card-button" style={buttonStyles} onClick={handleClick}>
            Get Started
          </button>
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
          to="/helpdesk/contactus"
        />
        <Card
          title="FAQ"
          description="Find quick answers to frequently asked questions"
          icon={HelpCircle}
          to="/helpdesk/faq"
        />
        <Card
          title="Feedback"
          description="Share your experience and read customer reviews"
          icon={FileText}
          to="/helpdesk/feedback"
        />
      </div>

      <div className="footer-section">
        <h3>Need Immediate Help?</h3>
        <p>For urgent issues, you can reach our support team directly at <a href="mailto:support@eatlystic.com">support@eatlystic.com</a></p>
      </div>
    </div>
  );
};

export default HelpDesk;