import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

// --- Icon components (lucide-react equivalents) ---
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

// Main Component
const HelpDesk = () => {

const navigate = useNavigate();



const Card = ({ title, description, icon: Icon, to }) => {
        const handleClick = () => {
            navigate(to); 
        };

        return (
            <div
                className="card"
            >
                <div className="card-inner-container">
                    <div className="icon-circle">
                        <Icon className="icon-style" />
                    </div>
                    <h3 className="card-title">{title}</h3>
                    <p className="card-description">{description}</p>
                    {/* The onClick handler is correctly placed on the button */}
                    <button className="card-button" onClick={handleClick}>
                        Get Started
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="help-center-page">
            {/* All CSS variables replaced with hardcoded hex values */}
            <style>{`
                /* --- Global and Layout Styles --- */
                .help-center-page {
                    background-color: #fff;
                    color: #181824; /* --dark-text */
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                /* --- Header Section --- */
                .header-section {
                    /* Original gradient for context or fallback */
                    background: linear-gradient(to right, #ff6f00ff, #ff9751ff); 
                    text-align: center;
                    padding: 60px 20px;
                    position: relative; /* Needed for positioning the overlay */
                    overflow: hidden; /* Ensures overlay doesn't spill out */
                }

                .header-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.3); /* Transparent black (30% opacity) */
                    z-index: 1; /* Darkens the main background (gradient/image) */
                }

                .header-content {
                    position: relative; /* Brings content above the overlay */
                    z-index: 2; /* Ensures text is visible above the overlay */
                    color: #fff; /* Ensure text color is white for contrast */

                    /* --- NEW STYLES FOR TRANSPARENT BOX AROUND TEXT --- */
                    display: inline-block; /* Makes the container only as wide as its content */
                    padding: 20px 40px; /* Adds space around the text */
                    margin: 0 auto; /* Centers the block if it's smaller than the parent */
                    border-radius: 8px;
                    background-color: rgba(0, 0, 0, 0.4); /* Transparent black background for the text box itself */
                    /* --- END NEW STYLES --- */
                }


                .header-section h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                    color: #fff; 
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                }

                .header-section p {
                    font-size: 1.1rem;
                    color: #fff; 
                    opacity: 0.9;
                }

                /* --- Cards Section --- */
                .cards-section {
                    background-color: #ffe0b2; /* --light-orange-bg */
                    padding: 60px 20px;
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 30px;
                    flex-grow: 1;
                }

                /* --- Card Styles --- */
                .card {
                    background-color: #fff; 
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    max-width: 320px;
                    width: 100%;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); 
                    border: 1px solid #ff9800; /* --primary-orange */
                }

                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
                }

                .icon-circle {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    background-color: rgba(255, 152, 0, 0.1); 
                }

                .icon-style {
                    width: 32px;
                    height: 32px;
                    color: #ff9800; /* --primary-orange */
                }

                .card-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: #181824; /* --dark-text */
                }

                .card-description {
                    font-size: 0.95rem;
                    margin-bottom: 25px;
                    color: #555;
                }

                .card-button {
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: background-color 0.3s ease, transform 0.1s ease;
                    color: #fff;
                    background-color: #ff9800; /* --primary-orange */
                    box-shadow: 0 4px 6px rgba(255, 152, 0, 0.3);
                }

                .card-button:hover {
                    background-color: #e68a00; /* --button-hover */
                    transform: translateY(-1px);
                }

                /* --- Footer Section --- */
                .footer-section {
                    background-color: #181824; /* --dark-text */
                    text-align: center;
                    padding: 40px 20px;
                    margin-top: auto;
                }

                .footer-section h3 {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                    color: #ffe0b2; /* --light-orange-bg */
                }

                .footer-section p {
                    font-size: 0.95rem;
                    color: #ccc; 
                    margin-bottom: 5px;
                }

                .footer-section a {
                    color: #ff9800; /* --primary-orange */
                    text-decoration: none;
                    font-weight: 600;
                }

                .footer-section a:hover {
                    text-decoration: underline;
                }

                /* --- Media Queries --- */
                @media (max-width: 768px) {
                    .cards-section {
                        padding: 40px 10px;
                    }
                    .card {
                        max-width: 100%;
                    }
                }
            `}</style>

            <Navbar />

            <div className="header-section">
                {/* Full-width transparent black overlay (darkens the whole header) */}
                <div className="header-overlay"></div>
                
                {/* Content for the header section with a transparent box behind it */}
                <div className="header-content">
                    <h1>Eatlystic Help Center</h1>
                    <p>Get the support you need. We're here to help with any questions, issues, or feedback you may have.</p>
                </div>
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

            <Footer/>
        </div>
    );
};

export default HelpDesk;