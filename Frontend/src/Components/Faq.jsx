import React, { useState, useEffect } from 'react';
// Import the real hook from react-router-dom
import { useNavigate } from 'react-router-dom'; 
import styles from '../styles/FAQ.module.css'; 
import Navbar from './Navbar';
import Footer from './Footer';

// NOTE: The mock block is removed to allow the real hook to work.

const FAQ = () => {
    const [expandedItems, setExpandedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // FIX: This now calls the actual hook imported from 'react-router-dom'
    const navigate = useNavigate(); 

    // FETCH FIX: Fetches data from the public/data/faq.json file
    useEffect(() => {
        // Use the public path for the mock JSON file
        fetch("/data/faq.json") 
          .then((res) => {
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            return res.json();
          })
          .then((data) => {
            setFaqData(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Failed to load FAQ data:", error);
            setLoading(false);
            setFaqData([]);
          });
    }, []);

    const toggleExpanded = (index) => {
        setExpandedItems(prev =>
            prev.includes(index)
                ? prev.filter(item => item !== index)
                : [...prev, index]
        );
    };

    const handleBackClick = () => {
        // FIX: The actual navigation call
        navigate("/helpdesk"); 
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredFAQ = faqData.filter(
        q =>
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.keywords.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <Navbar/>
            <div className={styles.header}>
                {/* RENDER FIX: The transparent overlay div */}
                <div className={styles.headerOverlay} />
                <div className={styles.headerContent}>
                    <button
                        className={styles.backButton}
                        onClick={handleBackClick} // This calls the real navigate
                    >
                        <span>←</span>
                        Back to Help Desk
                    </button>
                    <h1 className={styles.title}>
                        Frequently Asked Questions
                    </h1>
                    <p className={styles.subtitle}>
                        Find quick answers to common questions about Eatlystic
                    </p>
                </div>
            </div>
            <div className={styles.content}>
                {/* Search */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchIcon}>
                        🔍
                    </div>
                    <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                {/* FAQ Items */}
                {loading ? (
                    <div className={styles.noResults}>
                        <p className={styles.noResultsText}>
                            Loading...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.faqContainer}>
                            {filteredFAQ.map((faq, index) => {
                                const isExpanded = expandedItems.includes(index);
                                
                                // FIX: Calculated border-radius applied inline to ensure full color coverage.
                                const buttonRadius = isExpanded ? `8px 8px 0 0` : '10px';
                                const answerRadius = isExpanded ? `0 0 8px 8px` : '0';

                                return (
                                    <div key={index} className={styles.faqItem}>
                                        <button
                                            className={styles.faqButton}
                                            style={{ borderRadius: buttonRadius }}
                                            onClick={() => toggleExpanded(index)}
                                        >
                                            <span>{faq.q}</span>
                                            <span
                                                className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                                            >
                                                ›
                                            </span>
                                        </button>
                                        {isExpanded && (
                                            <div
                                                className={styles.answer}
                                                style={{ borderRadius: answerRadius }}
                                            >
                                                {faq.a}
                                            </div>
                                        )} 
                                    </div>
                                );
                            })}
                        </div>
                        {filteredFAQ.length === 0 && (
                            <div className={styles.noResults}>
                                <p className={styles.noResultsText}>
                                    No FAQs found matching your search. Try different keywords or browse all categories.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer/>
        </div>
    );
};

export default FAQ;