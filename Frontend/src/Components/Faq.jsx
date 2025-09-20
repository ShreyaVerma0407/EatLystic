import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch from /data/faq.json on component mount
  useEffect(() => {
    fetch("/data/faq.json")
      .then((res) => res.json())
      .then((data) => {
        setFaqData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    },
    header: {
      background:' linear-gradient(to right, #000000ff, #b54b04ff)',
      padding: '2rem'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    backButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.2s'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      margin: 0
    },
    subtitle: {
      fontSize: '1.125rem',
      opacity: 0.9,
      margin: 0
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '3rem'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#888',
      zIndex: 1
    },
    searchInput: {
      width: '100%',
      padding: '1rem 1rem 1rem 3rem',
      backgroundColor: '#2a2a2a',
      border: '1px solid #404040',
      borderRadius: '8px',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box'
    },
    faqContainer: {
      display: 'grid',
      gap: '1.5rem'
    },
    faqItem: {
      border: '2px solid white',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      overflow: 'hidden'
    },
    faqButton: {
      width: '100%',
      background: '#343439ff',
      border: 'none',
      color: 'white',
      textAlign: 'left',
      padding: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.25rem',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    chevron: {
      color: '#888',
      fontSize: '1.25rem',
      transition: 'transform 0.2s',
      flexShrink: 0
    },
    chevronExpanded: {
      transform: 'rotate(90deg)'
    },
    answer: {
      padding: '1.5rem',
      color: 'white',
      lineHeight: '1.6',
      fontSize: '1.125rem',
      background: 'linear-gradient(135deg, #000000, #cc4a1a)'
    },
    noResults: {
      backgroundColor: '#2a2a2a',
      padding: '3rem',
      textAlign: 'center',
      borderRadius: '12px',
      marginTop: '2rem'
    },
    noResultsText: {
      color: '#888',
      margin: 0
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

   const handleBackClick = () => {
    // Navigate to /helpdesk route
    navigate("/helpdesk");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleButtonHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.backgroundColor = '#1a1a25ff';
    } else {
      e.target.style.backgroundColor = '#2d2e30ff';
    }
  };

  const handleBackButtonHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    } else {
      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    }
  };

  const filteredFAQ = faqData.filter(
    q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <Navbar />
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button
            style={styles.backButton}
            onClick={handleBackClick}
            onMouseEnter={(e) => handleBackButtonHover(e, true)}
            onMouseLeave={(e) => handleBackButtonHover(e, false)}
          >
            <span>←</span>
            Back to Help Desk
          </button>
          <h1 style={styles.title}>
            Frequently Asked Questions
          </h1>
          <p style={styles.subtitle}>
            Find quick answers to common questions about Eatlystic
          </p>
        </div>
      </div>
      <div style={styles.content}>
        {/* Search */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
        </div>
        {/* FAQ Items */}
        {loading ? (
          <div style={styles.noResults}>
            <p style={styles.noResultsText}>
              Loading...
            </p>
          </div>
        ) : (
          <>
            <div style={styles.faqContainer}>
              {filteredFAQ.map((faq, index) => {
                const isExpanded = expandedItems.includes(index);
                return (
                  <div key={index} style={styles.faqItem}>
                    <button
                      style={styles.faqButton}
                      onClick={() => toggleExpanded(index)}
                      onMouseEnter={(e) => handleButtonHover(e, true)}
                      onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                      <span>{faq.q}</span>
                      <span 
                        style={{
                          ...styles.chevron,
                          ...(isExpanded ? styles.chevronExpanded : {})
                        }}
                      >
                        ›
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={styles.answer}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {filteredFAQ.length === 0 && (
              <div style={styles.noResults}>
                <p style={styles.noResultsText}>
                  No FAQs found matching your search. Try different keywords or browse all categories.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FAQ;
