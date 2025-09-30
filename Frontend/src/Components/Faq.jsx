import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/FAQ.module.css';
import Navbar from './Navbar';
import Footer from './Footer';

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch FAQ JSON from public folder
  useEffect(() => {
    fetch('/data/faq.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load FAQ data');
        return res.json();
      })
      .then((data) => {
        setFaqData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load FAQs at the moment.');
        setLoading(false);
      });
  }, []);

  const toggleExpanded = (index) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleBackClick = () => navigate('/helpdesk');

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredFAQ = faqData.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.header}>
        <div className={styles.headerOverlay} />
        <div className={styles.headerContent}>
          <button className={styles.backButton} onClick={handleBackClick}>
            ← Back to Help Desk
          </button>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Find quick answers to common questions about Eatlystic
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>🔍</div>
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
          <p className={styles.noResultsText}>Loading FAQs...</p>
        ) : error ? (
          <p className={styles.noResultsText}>{error}</p>
        ) : filteredFAQ.length === 0 ? (
          <p className={styles.noResultsText}>
            No FAQs found matching your search.
          </p>
        ) : (
          <div className={styles.faqContainer}>
            {filteredFAQ.map((faq, index) => {
              const isExpanded = expandedItems.includes(index);
              return (
                <div key={index} className={styles.faqItem}>
                  <button
                    className={styles.faqButton}
                    style={{
                      borderRadius: isExpanded ? '8px 8px 0 0' : '10px',
                    }}
                    onClick={() => toggleExpanded(index)}
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`${styles.chevron} ${
                        isExpanded ? styles.chevronExpanded : ''
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  {isExpanded && (
                    <div
                      className={styles.answer}
                      style={{ borderRadius: '0 0 8px 8px' }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
