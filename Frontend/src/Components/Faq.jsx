import React, { useState } from 'react'; // FIXED: Changed '=>' to 'from' and removed extraneous quotes
import Navbar from "./Navbar";  // adjust path if it's in Components folder, e.g. "../Components/Navbar"
import Footer from "./Footer"; // adjust path if it’s in Components folder

// --- MOCK COMPONENTS AND HOOKS FOR SINGLE-FILE MANDATE ---
// Mocking react-router-dom's useNavigate
import { useNavigate } from "react-router-dom";


// Mocking external components
{/* Navbar */}
<Navbar />




// MOCK DATA: Using internal mock data to ensure the component is runnable
const mockFaqData = [
    { q: "What is Eatlystic and how does it help me?", a: "Eatlystic is a food analytics platform that uses advanced algorithms to track your dietary intake, calculate nutritional data, and provide personalized meal recommendations based on your health goals.", keywords: "platform, tracking, nutrition, analysis, goals" },
    { q: "Is my personal dietary data secure?", a: "Absolutely. We prioritize user privacy. All personal and dietary data is fully encrypted using industry-standard protocols and stored securely, complying with strict data protection regulations.", keywords: "security, privacy, data, encryption, regulations" },
    { q: "How accurate is the nutritional information?", a: "Our nutritional database is sourced from verified, high-authority government and private data sets, ensuring a high level of accuracy for all food entries.", keywords: "accuracy, data, nutrition, information" },
    { q: "Can I use Eatlystic on my mobile device?", a: "Yes, Eatlystic is fully responsive and optimized for use on all mobile devices, including smartphones and tablets, offering a seamless experience.", keywords: "mobile, app, responsive, tablet" },
    { q: "How do I cancel my subscription?", a: "You can cancel your subscription anytime by navigating to the 'Settings' page, selecting 'Billing,' and following the cancellation prompt.", keywords: "subscription, cancel, billing, settings" },
];
// --- END MOCK COMPONENTS AND HOOKS ---


const FAQ = () => {
    const [expandedItems, setExpandedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [faqData, setFaqData] = useState(mockFaqData); // Using mock data
    const [loading, setLoading] = useState(false); // Set to false since data is mocked internally
    
    const navigate = useNavigate();

    // NOTE: The original useEffect to fetch /data/faq.json is commented out
    // and replaced with mock data to ensure the component runs without error.
    /*
    useEffect(() => {
        fetch("/data/faq.json")
          .then((res) => res.json())
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
    */

    const styles = {
        container: {
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#FFE8D6',
            color: 'black',
            minHeight: '100vh',
            margin: 0,
            padding: 0
        },
        header: {
            // Updated gradient style to make the separation from the body clearer
            background: 'linear-gradient(to right, #2c1a05ff, #8a410cff)', 
            padding: '2rem'
        },
        headerContent: {
            maxWidth: '1200px',
            margin: '0 auto'
        },
        backButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Lightened back button
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
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            margin: 0,
            color: 'white'
        },
        subtitle: {
            fontSize: '1.125rem',
            opacity: 0.9,
            margin: 0,
            color: 'white'
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
            color: '#444',
            zIndex: 1
        },
        searchInput: {
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            color: 'black',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
        },
        faqContainer: {
            display: 'grid',
            gap: '1.5rem'
        },
        faqItem: {
            // *** Outer container styling maintained ***
            border: '2px solid black',
            borderRadius: '10px', 
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
        },
        faqButton: {
            width: '100%',
            background: '#FF9800',
            border: 'none',
            color: 'black',
            textAlign: 'left',
            padding: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            boxSizing: 'border-box',
            userSelect: 'none',
        },
        chevron: {
            // Change color to black for better visibility/contrast
            color: 'black',
            fontSize: '1.5rem',
            transition: 'transform 0.2s',
            flexShrink: 0,
            userSelect: 'none',
        },
        chevronExpanded: {
            transform: 'rotate(90deg)'
        },
        answer: {
            padding: '1.5rem',
            color: 'black',
            lineHeight: '1.6',
            fontSize: '1.125rem',
            background: '#ffffff',
            borderTop: '2px solid black',
            boxSizing: 'border-box',
        },
        noResults: {
            backgroundColor: '#fff',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '12px',
            marginTop: '2rem',
            color: 'black',
            boxSizing: 'border-box',
        },
        noResultsText: {
            color: '#555',
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
        navigate("/helpdesk");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleButtonHover = (e, isEntering) => {
        if (isEntering) {
            e.target.style.backgroundColor = '#F57C00'; // Darker orange on hover
        } else {
            e.target.style.backgroundColor = '#FF9800'; // Original bright orange
        }
    };

    const handleBackButtonHover = (e, isEntering) => {
        if (isEntering) {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        } else {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
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
                                
                                // Set consistent radius for inner elements
                                const radius = '8px'; 
                                
                                // FIX: When collapsed (isExpanded is false), we now set an empty string 
                                // for borderRadius. This relies on the parent's `overflow: hidden`
                                // property to clip the button perfectly to the parent's `borderRadius: 10px`,
                                // ensuring the orange color fills the area up to the black border.
                                const buttonRadius = isExpanded ? `${radius} ${radius} 0 0` : '';
                                
                                const answerRadius = isExpanded ? `0 0 ${radius} ${radius}` : '0';

                                return (
                                    <div key={index} style={styles.faqItem}>
                                        <button
                                            style={{
                                                ...styles.faqButton,
                                                borderRadius: buttonRadius, // This is now '' when collapsed
                                            }}
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
                                            <div
                                                style={{
                                                    ...styles.answer,
                                                    borderRadius: answerRadius
                                                }}
                                            >
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
            <Footer />
        </div>
    );
};

export default FAQ;
