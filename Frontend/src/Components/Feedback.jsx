import { useState, useEffect } from "react";

// Helper function to render star icons
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          color: i <= rating ? "#ffc107" : "#d1d5db",
          fontSize: "20px",
          marginRight: "2px",
        }}
      >
        ★
      </span>
    );
  }
  return stars;
};

// ** UPDATED: Function to save review to the database **
const saveReviewToServer = async (reviewData) => {
  const url = 'http://localhost:3001/api/reviews';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      throw new Error('Failed to save review on server.');
    }
    const savedReview = await response.json();
    return savedReview;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
};

// ** UPDATED: Function to update review in the database **
const updateReviewInServer = async (id, reviewData) => {
  const url = `http://localhost:3001/api/reviews/${id}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      throw new Error('Failed to update review on server.');
    }
    const updatedReview = await response.json();
    return updatedReview;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// ** UPDATED: Function to delete review from the database **
const deleteReviewFromServer = async (id) => {
  const url = `http://localhost:3001/api/reviews/${id}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete review from server.');
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

export default function Feedback() {
  const [userReviews, setUserReviews] = useState([]);
  const [dummyReviews, setDummyReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/reviews');
        if (!response.ok) {
          throw new Error('Failed to load reviews from the database.');
        }
        const data = await response.json();

        // Separate user's reviews from others
        const fetchedUserReviews = data.filter(r => r.name === 'You');
        const fetchedDummyReviews = data.filter(r => r.name !== 'You');

        // Format and set state
        setUserReviews(fetchedUserReviews.map(r => ({
          id: r._id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          isUser: true
        })));

        setDummyReviews(fetchedDummyReviews.map(r => ({
          id: r._id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          isUser: false
        })));
        
      } catch (error) {
        console.error("Failed to load reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const reviewData = {
      comment: reviewForm.comment,
      rating: reviewForm.rating,
      name: "You"
    };

    try {
      if (editingReview) {
        const updatedReview = await updateReviewInServer(editingReview, reviewData);
        setUserReviews((prev) =>
          prev.map((review) =>
            review.id === updatedReview._id
              ? { ...review, rating: updatedReview.rating, comment: updatedReview.comment }
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
          rating: newReview.rating,
          comment: newReview.comment,
          isUser: true,
        };

        setUserReviews((prev) => [formattedNewReview, ...prev]);
        alert("Review Submitted!");
      }
      setReviewForm({ rating: 5, comment: "" });
    } catch (error) {
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleEditReview = (review) => {
    setReviewForm({
      rating: review.rating,
      comment: review.comment,
    });
    setEditingReview(review.id);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReviewFromServer(reviewId);
      setUserReviews((prev) => prev.filter((review) => review.id !== reviewId));
      alert("Review Deleted");
    } catch (error) {
      alert("Failed to delete review. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewForm({ rating: 5, comment: "" });
  };

  // ** Removed .sort() since date is no longer available **
  const allReviews = [...userReviews, ...dummyReviews];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#e0e0e0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(to right, #ff8c00, #ff4500)", padding: "24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <button
            onClick={() => alert("Navigating back...")}
            style={{
              marginBottom: "16px",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: "#2d2d2d",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            ← Back to Help Desk
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
            Feedback & Reviews
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Share your experience and see what others are saying about Eatlystic
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        {/* Review Form */}
        <div style={{ padding: "24px", backgroundColor: "#2d2d2d", borderRadius: "8px", marginBottom: "32px", border: '1px solid white' }}>
          <h2 style={{ fontSize: "24px", fontWeight: "semibold", marginBottom: "16px", color: "white" }}>
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h2>
          <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>
                Rating
              </label>
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: star <= reviewForm.rating ? "#ffc107" : "#d1d5db",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "medium", marginBottom: "8px" }}>
                Your Review
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with Eatalystic..."
                rows={4}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#3a3a3a",
                  color: "white",
                  border: "1px solid #555",
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
                    color: "white",
                    border: "1px solid #555",
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
          <h2 style={{ fontSize: "30px", fontWeight: "semibold", marginBottom: "24px", color: "#ffc107" }}>
            What others have to say?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {allReviews.map((review) => (
              <div key={review.id} style={{ padding: "24px", backgroundColor: "#2d2d2d", borderRadius: "8px", border: '1px solid white' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <h3 style={{ fontWeight: "semibold", color: "white" }}>{review.name}</h3>
                      <div style={{ display: "flex" }}>{renderStars(review.rating)}</div>
                    </div>
                  </div>
                  {review.isUser && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditReview(review)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#3a3a3a",
                          color: "white",
                          border: "1px solid #555",
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
                          backgroundColor: "#3a3a3a",
                          color: "white",
                          border: "1px solid #555",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ color: "#a0a0a0" }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}