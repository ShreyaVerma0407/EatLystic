import React from "react";
import styles from "../styles/Footer.module.css";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Wave SVG */}
      <div className={styles.wave}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#ff6600"
            fillOpacity="1"
            d="M0,96L60,117.3C120,139,240,181,360,176C480,171,600,117,720,117.3C840,117,960,171,1080,181.3C1200,192,1320,160,1380,144L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
          <path
            fill="#ff8533"
            fillOpacity="0.7"
            d="M0,192L80,197.3C160,203,320,213,480,197.3C640,181,800,139,960,122.7C1120,107,1280,117,1360,122.7L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className={styles.footerContainer}>
        {/* About */}
        <div className={styles.footerSection}>
          <h3 className={styles.brand}>Eatlystic</h3>
          <p>
            Transform your eating habits with intelligent analytics and
            personalized nutrition insights.
          </p>
         <p><FaMapMarkerAlt className={styles.footerIcon} /> 123 Nutrition Ave, Health City</p>
<p><FaPhoneAlt className={styles.footerIcon} /> +1 (555) 123-4567</p>
<p><FaEnvelope className={styles.footerIcon} /> support@eatlystic.com</p>

        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/helpdesk">HelpDesk</Link></li>
            <li><Link to="/pantryreport">Stockstat</Link></li>
            <li><Link to="/shoppingcart">Cartify</Link></li>
            <li><Link to="/helpdesk/contactus">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className={styles.footerSection}>
          <h3>Services</h3>
          <ul>
            <li><Link to="/pantry">Pantry</Link></li>
            <li><Link to="/nutrient">Nurtilog</Link></li>
            <li><Link to="/calorie">CaloriFi</Link></li>
            <li><Link to="/recipe">Recipe Generator</Link></li>
            <li><Link to="/fitness">Trackify</Link></li>
          </ul>
        </div>

        {/* Stay Updated */}
        <div className={styles.footerSection}>
          <h3>Stay Updated</h3>
          <p>Get the latest nutrition tips and feature updates delivered to your inbox.</p>
          <div className={styles.newsletter}>
            <input type="email" placeholder="Enter your email" />
            <button>&rarr;</button>
          </div>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div 
  className={styles.footerBottom}
  style={{ paddingLeft: '100px', paddingRight: '30px',fontWeight:'bolder' }} // Added left and right padding
>
  <h5 style={{paddingLeft:'400px'}}>© 2025 Eatlystic. All rights reserved. Empowering healthier lifestyles through data.</h5>
 
</div>
    </footer>
  );
}
