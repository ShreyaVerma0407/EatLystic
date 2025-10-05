import React from "react";
import styles from "../styles/Home.module.css";
// NOTE: Assuming 'image.png' is the path to your background image
import bgImage from "./image.png"; 


// Component for the top marquee bar
const Marquee = () => {
  // Duplicating the content inside the marquee for a smooth, continuous loop
  const marqueeContent = (
    <>
      <span>🎉 Apratim 2025!</span>
      <span className={styles.separator}>🎵 Celebrity Nights - Big Announcements Coming Soon</span>
      <span>🏆 Prizes Worth 5 Lakhs+ Up</span>
    </>
  );

  return (
    <div className={styles.marqueeContainer}>
      {/* Increased the duplication count to ensure continuous scrolling over the visible area */}
      <p className={styles.marqueeText}>
        {marqueeContent}
        {marqueeContent}
        {marqueeContent}
        {marqueeContent} 
        {marqueeContent}
        {marqueeContent}
      </p>
    </div>
  );
};

// Component for the About Us section
const AboutUsSection = () => {
  return (
    <div className={styles.aboutUsSection}>
      <h2 className={styles.aboutUsHeading}>ABOUT US</h2>
      <div className={styles.aboutUsContentBox}>
        <p>
          <span className={styles.highlightText}>Apratim</span>, the annual <span className={styles.boldText}>Techno-Cultural Fest of Chandigarh College of Engineering and Technology (CCET), Sector-26</span>, stands as a dynamic convergence of innovation, creativity, and celebration. This prestigious event showcases a unique blend of technology, arts, and culture, providing a platform for students and enthusiasts to display their talents and ideas.
        </p>
        <p>
          Over the years, Apratim has grown into a multifaceted fest, featuring a wide array of events, competitions, workshops, and performances that cater to both the technically inclined and the creatively driven. From <span className={styles.secondaryHighlightText}>coding hackathons, robotics competitions, and tech exhibits</span> to <span className={styles.tertiaryHighlightText}>artistic showcases, music and dance performances, and cultural displays</span> — Apratim has something for everyone.
        </p>
      </div>
    </div>
  );
};

// Component for the Registration Call-to-Action Section
const RegistrationCTASection = () => {
    return (
        <div className={styles.registrationCtaSection}>
            <div className={styles.ctaBox}>
                <div className={styles.ctaIconCircle}>
                    {/* Inline SVG for the star/sparkle icon */}
                    <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20M15.5 8.5l-7 7M8.5 8.5l7 7M15.5 15.5l-7-7M8.5 15.5l7-7"/>
                    </svg>
                </div>
                <h2 className={styles.ctaHeading}>REGISTER NOW</h2>
                <p className={styles.ctaSubtext}>
                    Be part of the most exciting techno-cultural fest. Join us for an 
                    unforgettable experience filled with innovation, creativity, and celebration!
                </p>
                <a 
                    href="#" 
                    className={styles.ctaButton}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Register for Apratim 2025
                    {/* External Link Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '10px'}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
            </div>
        </div>
    );
};

// Component for the Brochure Download Section
const BrochureSection = () => {
    return (
        <div className={styles.brochureSection}>
            <h2 className={styles.brochureHeading}>BROCHURE</h2>
            <div className={styles.brochureBox}>
                <div className={styles.brochureIconCircle}>
                    {/* Inline SVG for the document icon */}
                    <svg className={styles.brochureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <h3 className={styles.brochureTitle}>Download Event Brochure</h3>
                <p className={styles.brochureSubtext}>
                    Get all the details about events, competitions, workshops, schedules, and more. Download our comprehensive brochure to stay updated.
                </p>
                <a 
                    href="#" // Placeholder for the actual PDF link
                    className={styles.brochureButton}
                    download
                >
                    {/* Download Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Brochure
                </a>
            </div>
        </div>
    );
};

// NEW: Component for the Contact Section
const ContactSection = () => {
    return (
        <div className={styles.contactSection}>
            <h2 className={styles.contactHeading}>GET IN TOUCH</h2>
            <div className={styles.contactBox}>
                <div className={styles.contactDetails}>
                    {/* Contact Item: Convener */}
                    <div className={styles.contactItem}>
                        <div className={styles.contactIconCircle}>
                            {/* Phone Icon */}
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.41-2.66m-1.78-1.78a2 2 0 0 1 2.18 2h3a2 2 0 0 0 2 2h3.5"></path>
                                <line x1="18" y1="2" x2="22" y2="6"></line>
                                <line x1="18" y1="22" x2="22" y2="18"></line>
                                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95"></path>
                            </svg>
                        </div>
                        <div>
                            <p className={styles.contactLabel}>Apratim Convener</p>
                            <p className={styles.contactValue}>Akshat Kanwar</p>
                            <p className={styles.contactValue}>+91 6283125675</p>
                        </div>
                    </div>

                    {/* Contact Item: Co-Convener */}
                    <div className={styles.contactItem}>
                        <div className={styles.contactIconCircle}>
                            {/* Phone Icon */}
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.41-2.66m-1.78-1.78a2 2 0 0 1 2.18 2h3a2 2 0 0 0 2 2h3.5"></path>
                                <line x1="18" y1="2" x2="22" y2="6"></line>
                                <line x1="18" y1="22" x2="22" y2="18"></line>
                                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95"></path>
                            </svg>
                        </div>
                        <div>
                            <p className={styles.contactLabel}>Apratim Co-Convener</p>
                            <p className={styles.contactValue}>Ritika Saini</p>
                            <p className={styles.contactValue}>+91 6283125675</p>
                        </div>
                    </div>

                    {/* Contact Item: Email */}
                    <div className={styles.contactItem}>
                        <div className={styles.contactIconCircle}>
                            {/* Mail Icon */}
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <div>
                            <p className={styles.contactLabel}>Email</p>
                            <p className={styles.contactValue}>apratim@ccet.ac.in</p>
                        </div>
                    </div>

                    {/* Contact Item: Location */}
                    <div className={styles.contactItem}>
                        <div className={styles.contactIconCircle}>
                            {/* Map Pin Icon */}
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div>
                            <p className={styles.contactLabel}>Location</p>
                            <p className={styles.contactValue}>Chandigarh College of Engineering and Technology</p>
                            <p className={styles.contactValue}>Sector 26, Chandigarh</p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className={styles.mapContainer}>
                    {/* Placeholder for embedded map */}
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.351290610996!2d76.8123018751522!3d30.74100907459141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fefb480c5549d%3A0x89e00185e783457a!2sChandigarh%20College%20of%20Engineering%20%26%20Technology%2C%20Sector%2026%2C%20Chandigarh!5e0!3m2!1sen!2sin!4v1707833000000!5m2!1sen!2sin" 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className={styles.googleMap}
                        title="CCET Chandigarh Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};


// Main component
const ApratimHomePage = () => {
  return (
    <div className={styles.mainContainer}>
      
      {/* 1. Full-Screen Image Header Section */}
      <div 
        className={styles.fullScreenHeader}
        // IMPORTANT: Ensure the bgImage path is correct
        style={{ backgroundImage: `url(${bgImage})` }} 
      >
        <div className={styles.headerOverlay}>
            <div className={styles.headerContent}> 
                <h1 className={styles.text}>
                    apratim <span className={styles.year}>2025</span>
                </h1>
                <button className={styles.registerButton}>
                    REGISTER NOW
                </button>
            </div>
        </div>
      </div>

      {/* 2. Main Content Section (Marquee and Sections) */}
      <div className={styles.contentSection}>
        
        <Marquee />
        
        {/* --- Decorative Elements (Glow Circles) --- */}
        <div className={styles.decorativeOverlay}>
          <div className={styles.glowingCircleLargeLeft}></div>
          <div className={styles.glowingCircleSmallLeft}></div>
          <div className={styles.glowingCircleMediumRight}></div>
          <div className={styles.glowingCircleSmallTopRight}></div>
        </div>

        <div className={styles.contentWrapper}>
          <AboutUsSection />
          <RegistrationCTASection /> 
          <BrochureSection />
          <ContactSection /> {/* Added Contact Section */}
        </div>
      </div>
      
    </div>
  );
};

export default ApratimHomePage;
