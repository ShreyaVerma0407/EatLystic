// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Logout() {
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  useEffect(() => {
    const logoutUser = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/logout`, { userId });
      } catch (err) {
        console.error("Logout API error:", err);
      } finally {
        localStorage.removeItem("userId");
      }
    };

    logoutUser();
  }, [navigate, API_BASE_URL]);

  return (
    <div style={styles.container}>
      <div style={styles.waveBg}></div>

      {/* Glow Orbs */}
      <div style={{ ...styles.orb, top: "20%", left: "10%", background: "rgba(255, 183, 77, 0.4)" }}></div>
      <div style={{ ...styles.orb, bottom: "15%", right: "15%", background: "rgba(255, 138, 128, 0.4)" }}></div>
      <div style={{ ...styles.orb, top: "60%", left: "30%", background: "rgba(129, 212, 250, 0.4)" }}></div>

      {/* Stars */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.star,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        ></div>
      ))}

     <div style={styles.card}>
  <div style={styles.imageWrapper}>
    <img src="/images/user-logout.png" alt="Logout" style={styles.image} />
  </div>
  <h2 style={styles.title}>Logout Successful</h2>
  <p style={styles.text}>
    You have been successfully logged out.

    Thank you for visiting! We hope to see you again soon.
  </p>
  <button style={styles.button} onClick={() => navigate("/login")}>
    Log In Again ⟲
  </button>
</div>


      {/* Floating animated bubbles */}
      <div style={{ ...styles.bubble, top: "15%", left: "5%", width: 120, height: 120, animationDelay: "0s" }}></div>
      <div style={{ ...styles.bubble, top: "45%", left: "20%", width: 160, height: 160, animationDelay: "2s" }}></div>
      <div style={{ ...styles.bubble, top: "75%", right: "15%", width: 140, height: 140, animationDelay: "4s" }}></div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ff9966 0%, #ffecd2 100%)", // pastel orange
    overflow: "hidden",
    fontFamily: "'Arial', sans-serif",
  },
  waveBg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 70%)",
    top: "-50%",
    left: "-50%",
    animation: "rotateBg 20s linear infinite",
  },
  card: {
    position: "relative",
    zIndex: 5,
    background: "#fff",
    borderRadius: 15,
    padding: "40px 30px",
    width: 400,
    textAlign: "center",
    boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
    animation: "fadeInScale 1s ease-out",
  },
  icon: {
    fontSize: 40,
    marginBottom: 20,
  },
  title: {
    margin: "10px 0",
  },
  text: {
    fontSize: 20,
    color: "#333",
    marginBottom: 30,
  },
  button: {
    padding: "10px 25px",
    border: "none",
    borderRadius: 25,
    backgroundColor: "#ff7043",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  bubble: {
    position: "absolute",
    background: "rgba(255,255,255,0.35)",
    borderRadius: "50%",
    zIndex: 2,
    animation: "floatUp 10s ease-in-out infinite",
  },
  orb: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: "50%",
    filter: "blur(80px)",
    animation: "pulse 8s ease-in-out infinite",
    zIndex: 1,
  },
  star: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "white",
    opacity: 0.8,
    animation: "twinkle 2s infinite alternate",
    zIndex: 3,
  },
  imageWrapper: {
  display: "flex",
  justifyContent: "center",
  marginBottom: 20,
},
image: {
  width: "80px",   // adjust as needed
  height: "80px",
  objectFit: "contain",
},

  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "#555",
  },
};

// Keyframes (inject)
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-150px) scale(1.3); opacity: 0.5; }
  100% { transform: translateY(-300px) scale(1); opacity: 0.8; }
}
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes rotateBg {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 0.9; }
}
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes twinkle {
  from { opacity: 0.3; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.2); }
}
`, styleSheet.cssRules.length);

export default Logout;
