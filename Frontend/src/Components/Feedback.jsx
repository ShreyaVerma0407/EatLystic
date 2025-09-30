import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Helper to render stars
const renderStars = (stars) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i + 1}
      style={{
        color: i + 1 <= stars ? "#ffc107" : "#d1d5db",
        fontSize: "20px",
        marginRight: "2px",
      }}
    >
      ★
    </span>
  ));
};

export default function Feedback() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

  const [userReviews, setUserReviews] = useState([]);
  const [dummyReviews, setDummyReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ stars: 5, text: "", name: "You" });
  const [editingReview, setEditingReview] = useState(null);

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`);
      if (!response.ok) throw new Error("Failed to load reviews");
      const data = await response.json();

      setUserReviews(data.filter(r => r.name === "You").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setDummyReviews(data.filter(r => r.name !== "You").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // CRUD operations
  const saveReview = async (reviewData) => {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error("Failed to save review");
    return res.json();
  };

  const updateReview = async (id, reviewData) => {
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error("Failed to update review");
    return res.json();
  };

  const deleteReview = async (id) => {
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete review");
    return res.json();
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = { ...reviewForm };

    try {
      if (editingReview) {
        const updated = await updateReview(editingReview, reviewData);
        setUserReviews(prev => prev.map(r => r.id === updated._id ? { ...r, ...updated } : r));
        setEditingReview(null);
        alert("Review updated!");
      } else {
        const newReview = await saveReview(reviewData);
        setUserReviews(prev => [{ id: newReview._id, ...newReview }, ...prev]);
        alert("Review submitted!");
      }
      setReviewForm({ stars: 5, text: "", name: "You" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (review) => {
    setReviewForm({ stars: review.stars, text: review.text, name: review.name });
    setEditingReview(review.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      setUserReviews(prev => prev.filter(r => r.id !== id));
      alert("Review deleted!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewForm({ stars: 5, text: "", name: "You" });
  };

  const allReviews = [...userReviews, ...dummyReviews];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fef3c7", color: "#374151" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(to right, #f97316, #f97316)", padding: "24px" }}>
        <button
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            color: "black",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
          onClick={() => navigate("/helpdesk")}
        >
          ← Back to Help Desk
        </button>

        <div style={{ textAlign: "center", backgroundColor: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "8px" }}>
          <h1 style={{ fontSize: "48px", color: "white" }}>Feedback</h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.9)" }}>
            Share your experience and see what others are saying about Eatlystic
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        {/* Review Form */}
        <div style={{ padding: "24px", backgroundColor: "#fff", borderRadius: "8px", border: "2px solid #f97316", marginBottom: "32px" }}>
          <h2>{editingReview ? "Edit Your Review" : "Write a Review"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="text"
              value={reviewForm.name}
              onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your Name"
              required
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
            <div>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  onClick={() => setReviewForm(prev => ({ ...prev, stars: star }))}
                  style={{ cursor: "pointer", fontSize: "20px", color: star <= reviewForm.stars ? "#ffc107" : "#d1d5db" }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={reviewForm.text}
              onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Share your experience..."
              rows={4}
              required
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#ff8c00", color: "white", borderRadius: "4px", border: "none" }}>
                {editingReview ? "Update Review" : "Submit Review"}
              </button>
              {editingReview && (
                <button type="button" onClick={handleCancelEdit} style={{ padding: "10px 20px", borderRadius: "4px", border: "1px solid #d1d5db" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h2 style={{ color: "#f97316" }}>What others have to say?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {allReviews.map(r => (
              <div key={r.id} style={{ padding: "24px", backgroundColor: "#fff", border: "2px solid #f97316", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3>{r.name}</h3>
                    <div>{renderStars(r.stars)}</div>
                  </div>
                  {r.name === "You" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEdit(r)}>Edit</button>
                      <button onClick={() => handleDelete(r.id)}>Delete</button>
                    </div>
                  )}
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
