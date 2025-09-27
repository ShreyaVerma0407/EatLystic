import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import navigate hook
import Navbar from "./Navbar";
import Footer from './Footer';
// Helper function to render star icons
const renderStars = (stars) => {
  const starIcons = [];
  for (let i = 1; i <= 5; i++) {
    starIcons.push(
      <span
        key={i}
        style={{
          color: i <= stars ? "#ffc107" : "#d1d5db",
          fontSize: "20px",
          marginRight: "2px",
        }}
      >
        ★
      </span>
    );
  }
  return starIcons;
};

export default function Feedback() {
  const navigate = useNavigate(); // Hook for navigation

  const [userReviews, setUserReviews] = useState([]);
  const [dummyReviews, setDummyReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    stars: 5,
    text: "",
    name: "You", // Default name "You" for user
  });
  const [editingReview, setEditingReview] = useState(null);

  // Styles for Back button (matches your screenshot)
  const backButtonStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    color: "black", // Changed to black for contrast
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "background-color 0.2s",
  };

  // Back button hover handlers
  function handleBackButtonHover(e, entering) {
    if (entering) {
      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    } else {
      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    }
  }

  // Handle hover for review divs
  const handleReviewDivHover = (e, entering) => {
    if (entering) {
      e.currentTarget.style.borderColor = "#f97316"; // Darker orange on hover
      e.currentTarget.style.boxShadow = "0 4px 10px rgba(249, 115, 22, 0.3)"; // Optional subtle shadow
    } else {
      e.currentTarget.style.borderColor = "#f97316"; // Original orange border
      e.currentTarget.style.boxShadow = "none";
    }
  };

  // Back button click - navigate to /helpdesk
  function handleBackClick() {
    navigate("/helpdesk");
  }

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/reviews");
        if (!response.ok) {
          throw new Error("Failed to load reviews from the database.");
        }
        const data = await response.json();

        // Separate user's reviews and others', sort newest first
        const fetchedUserReviews = data.filter((r) => r.name === "You");
        const fetchedDummyReviews = data.filter((r) => r.name !== "You");

        setUserReviews(
          fetchedUserReviews.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setDummyReviews(
          fetchedDummyReviews.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  // Save review on server
  const saveReviewToServer = async (reviewData) => {
    const url = "http://localhost:3001/api/reviews";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error("Failed to save review on server.");
    return response.json();
  };

  // Update review on server
  const updateReviewInServer = async (id, reviewData) => {
    const url = `http://localhost:3001/api/reviews/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error("Failed to update review on server.");
    return response.json();
  };

  // Delete review on server
  const deleteReviewFromServer = async (id) => {
    const url = `http://localhost:3001/api/reviews/${id}`;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete review from server.");
    return response.json();
  };

  // Handle form submit for add or update
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const reviewData = {
      text: reviewForm.text,
      stars: reviewForm.stars,
      name: reviewForm.name,
    };
    try {
      if (editingReview) {
        const updatedReview = await updateReviewInServer(editingReview, reviewData);
        setUserReviews((prev) =>
          prev.map((review) =>
            review.id === updatedReview._id
              ? {
                  ...review,
                  stars: updatedReview.stars,
                  text: updatedReview.text,
                  name: updatedReview.name,
                }
              : review
          )
        );
        setEditingReview(null);
        alert("Review Updated!");
      } else {
        const newReview = await saveReviewToServer(reviewData);
        const formattedNewReview = {
          id: newReview._id,
          name: newReview.name,
          stars: newReview.stars,
          text: newReview.text,
          isUser: true,
        };
        setUserReviews((prev) => [formattedNewReview, ...prev]); // Add new review on top
        alert("Review Submitted!");
      }
      setReviewForm({ stars: 5, text: "", name: "You" }); // Reset form
    } catch (error) {
      alert("Failed to submit review. Please try again.");
    }
  };

  // Start editing a review
  const handleEditReview = (review) => {
    setReviewForm({
      stars: review.stars,
      text: review.text,
      name: review.name,
    });
    setEditingReview(review.id);
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReviewFromServer(reviewId);
      setUserReviews((prev) => prev.filter((review) => review.id !== reviewId));
      alert("Review Deleted");
    } catch (error) {
      alert("Failed to delete review. Please try again.");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewForm({ stars: 5, text: "", name: "You" });
  };

  // Combine all reviews for display
  const allReviews = [...userReviews, ...dummyReviews];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fef3c7", color: "#374151" }}>
      {/* Navbar */}
      <Navbar />

      {/* Header with gradient background */}
      <div style={{ background: "linear-gradient(to right, #f97316, #f97316)", padding: "24px" }}>
        <button
          style={backButtonStyle}
          onClick={handleBackClick}
          onMouseEnter={(e) => handleBackButtonHover(e, true)}
          onMouseLeave={(e) => handleBackButtonHover(e, false)}
        >
          <span>←</span>
          Back to Help Desk
        </button>
        {/* Transparent black background for heading and paragraph */}
        <div style={{ textAlign: "center", backgroundColor: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "8px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
            Feedback
          </h1>
          <p style={{ fontSize: "18px", fontWeight: "medium", color: "rgba(255, 255, 255, 0.9)" }}>
            Share your experience and see what others are saying about Eatlystic
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        {/* Review Form */}
        <div
          style={{
            padding: "24px",
            backgroundColor: "#ffffff", // Changed to White
            borderRadius: "8px",
            marginBottom: "32px",
            border: "2px solid #f97316", // Thin orange border
            color: "#374151", // Text color inside form changed to dark gray
            transition: "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Added transition
          }}
          onMouseEnter={(e) => handleReviewDivHover(e, true)}
          onMouseLeave={(e) => handleReviewDivHover(e, false)}
        >
          <h2
            style={{ fontSize: "24px", fontWeight: "semibold", marginBottom: "16px", color: "#1f2937" }} // Header color adjusted
          >
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h2>
          <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#f3f4f6", // Light input background
                  color: "#1f2937", // Dark text color
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}
              >
                Rating
              </label>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewForm((prev) => ({ ...prev, stars: star }))}
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: star <= reviewForm.stars ? "#ffc107" : "#d1d5db",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}
              >
                Your Review
              </label>
              <textarea
                value={reviewForm.text}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with Eatalystic..."
                rows={4}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#f3f4f6", // Light input background
                  color: "#1f2937", // Dark text color
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: "4px",
                  backgroundColor: "#ff8c00",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {editingReview ? "Update Review" : "Submit Review"}
              </button>
              {editingReview && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "#374151", // Changed to dark gray for contrast
                    border: "1px solid #d1d5db", // Changed border to light gray
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h2
            style={{ fontSize: "30px", fontWeight: "semibold", marginBottom: "24px", color: "#f97316" }} // Header color adjusted to orange
          >
            What others have to say?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {allReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: "24px",
                  backgroundColor: "#ffffff", // Changed to White
                  borderRadius: "8px",
                  border: "2px solid #f97316", // Thin orange border
                  transition: "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Added transition
                }}
                onMouseEnter={(e) => handleReviewDivHover(e, true)}
                onMouseLeave={(e) => handleReviewDivHover(e, false)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}
                    >
                      <h3 style={{ fontWeight: "semibold", color: "#1f2937" }}>{review.name}</h3> {/* Text color adjusted */}
                      <div style={{ display: "flex" }}>{renderStars(review.stars)}</div>
                    </div>
                  </div>
                  {review.isUser && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditReview(review)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#f3f4f6", // Light button background
                          color: "#1f2937", // Dark button text
                          border: "1px solid #d1d5db",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#f3f4f6", // Light button background
                          color: "#1f2937", // Dark button text
                          border: "1px solid #d1d5db",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ color: "#4b5563" }}>{review.text}</p> {/* Text color adjusted */}
              </div>
            ))}
          </div>
        </div>
      </div><Footer/>
    </div>
  );
}