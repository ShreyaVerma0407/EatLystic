import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Simple nutritional evaluation logic for demo (customize as needed)
function evaluateNutrition(answers) {
  let energy_kcal = 2000;
  let protein_g = 50;
  let carbs_g = 250;
  let fat_g = 70;

  switch (answers.activity) {
    case "Sedentary":
      energy_kcal -= 400;
      protein_g -= 10;
      fat_g -= 10;
      break;
    case "Lightly Active":
      energy_kcal -= 150;
      break;
    case "Very Active":
      energy_kcal += 300;
      protein_g += 20;
      fat_g += 10;
      break;
    default:
      break;
  }

  switch (answers.goal) {
    case "Weight Loss":
      energy_kcal -= 500;
      carbs_g -= 50;
      fat_g -= 10;
      break;
    case "Weight Gain":
      energy_kcal += 300;
      protein_g += 10;
      fat_g += 10;
      break;
    case "Muscle Gain":
      energy_kcal += 400;
      protein_g += 25;
      break;
    default:
      break;
  }

  if (answers.ageGroup === "50+ years") {
    protein_g += 5;
  }

  // Ensure no negative values
  protein_g = Math.max(0, protein_g);
  fat_g = Math.max(0, fat_g);
  carbs_g = Math.max(0, carbs_g);
  energy_kcal = Math.max(0, energy_kcal);

  return { energy_kcal, protein_g, carbs_g, fat_g };
}

const QUESTIONS = [
  { question: "What's your age group?", options: ["18-25 years", "26-35 years", "36-50 years", "50+ years"], key: "ageGroup" },
  { question: "What's your gender?", options: ["Male", "Female", "Other"], key: "gender" },
  { question: "What's your activity level?", options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], key: "activity" },
  { question: "What's your primary health goal?", options: ["Weight Loss", "Weight Gain", "Maintenance", "Muscle Gain"], key: "goal" },
  { question: "Select your height range:", options: ["< 150 cm", "150-165 cm", "166-180 cm", "> 180 cm"], key: "height" },
  { question: "Select your weight range:", options: ["< 50 kg", "50-65 kg", "66-80 kg", "> 80 kg"], key: "weight" },
];

const QuizModal = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const selectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [QUESTIONS[currentIndex].key]: value }));
  };

  const next = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      const nutrition = evaluateNutrition(answers);
      console.log("Quiz Answers:", answers);
      console.log("Calculated Nutrition:", nutrition);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          borderRadius: 16,
          maxWidth: 480,
          padding: "24px 32px",
          color: "white",
          boxShadow: "0 0 32px #000c",
          backgroundColor: "#000",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <h1 style={{ fontWeight: "bold", fontSize: 32, marginBottom: 7, textAlign: "center" }}>
          MacroChef Nutrition Assessment
        </h1>
        <div style={{ color: "#eee", fontWeight: 500, marginBottom: 18, textAlign: "center" }}>
          Help us personalize your nutritional recommendations
        </div>
        <div style={{ fontSize: 14, color: "#ff9000", marginBottom: "10px" }}>
          Question {currentIndex + 1} of {QUESTIONS.length}
          <span style={{ float: "right", color: "#fff" }}>
            {(((currentIndex + 1) / QUESTIONS.length) * 100).toFixed(0)}% complete
          </span>
          <div
            style={{
              marginTop: 4,
              height: 4,
              background: "#222",
              borderRadius: "99px",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#ff9000",
                width: `${(((currentIndex + 1) / QUESTIONS.length) * 100)}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0" }}>{QUESTIONS[currentIndex].question}</h2>
        <div>
          {QUESTIONS[currentIndex].options.map((option) => {
            const selected = answers[QUESTIONS[currentIndex].key] === option;
            return (
              <label
                key={option}
                style={{
                  display: "block",
                  background: "#262627",
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: "10px 20px",
                  cursor: "pointer",
                  border: selected ? "2px solid #ff9000" : "2px solid transparent",
                  color: selected ? "#ff9000" : "#fff",
                  fontWeight: selected ? "bold" : 500,
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name={QUESTIONS[currentIndex].key}
                  value={option}
                  checked={selected}
                  onChange={() => selectOption(option)}
                  style={{ display: "none" }}
                />
                {option}
              </label>
            );
          })}
        </div>
        <button
          disabled={!answers[QUESTIONS[currentIndex].key]}
          style={{
            marginTop: 20,
            background: "#ff9000",
            color: "#222",
            fontWeight: 800,
            fontSize: 17,
            borderRadius: 12,
            border: "none",
            padding: "11px 28px",
            cursor: answers[QUESTIONS[currentIndex].key] ? "pointer" : "not-allowed",
            opacity: answers[QUESTIONS[currentIndex].key] ? 1 : 0.45,
          }}
          onClick={next}
        >
          {currentIndex < QUESTIONS.length - 1 ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
}

// DashboardCard component for a clean, reusable UI element
function DashboardCard({ icon, title, description, onClick }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #2a2a30 0%, #1f1f24 100%)",
      borderRadius: 16,
      padding: 28,
      border: "1px solid #333",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: "pointer",
    }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 40,
          height: 40,
          background: "linear-gradient(135deg, #ff9000, #ff7b00)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          userSelect: "none"
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: 28, fontWeight: "700", margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: 14, fontWeight: "bold", color: "#999", marginTop: 8 }}>{description}</p>
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
        style={{
          background: "transparent",
          color: "#ff9000",
          fontWeight: 700,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          marginTop: 16
        }}
      >
        Explore →
      </button>
    </div>
  );
}

// Reusable button styles
const primaryButtonStyle = {
  background: "linear-gradient(135deg, #ff9000, #ff7b00)",
  color: "#000",
  fontWeight: 700,
  fontSize: 16,
  padding: "14px 28px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(255, 144, 0, 0.3)",
  transition: "transform 0.2s",
};

const secondaryButtonStyle = {
  background: "transparent",
  color: "#ff9000",
  fontWeight: 700,
  fontSize: 16,
  padding: "14px 28px",
  borderRadius: 12,
  border: "2px solid #ff9000",
  cursor: "pointer",
  transition: "all 0.2s",
};

// Navbar component for this single-file application
const Navbar = () => (
  <div style={{ padding: "16px 24px", textAlign: "right", borderBottom: "1px solid #333" }}>
    <h2 style={{ color: "#fff" }}>MacrosChef</h2>
  </div>
);

// Main component, refactored to be a static front-end
const App = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const navigate = useNavigate();

  // Background image
  useEffect(() => {
    const bgImage = "/images/Macrosquizbg.png";
    document.body.style.backgroundImage = `url(${bgImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1f", color: "#fff" }}>
      {/* Navbar placeholder */}
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{
            fontSize: 70,
            fontWeight: 800,
            marginBottom: 12,
            background: "linear-gradient(135deg, #fff 0%, #ff9000 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Welcome to Your Nutrition Hub
          </h1>
          <p style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#bbb",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6
          }}>
            Your personalized nutrition dashboard is ready! Explore each section to optimize your health journey.
          </p>
        </div>

        {/* Set Profile Button */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <button
            onClick={() => setShowQuiz(true)}
            style={primaryButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Set Your Profile with Rapid Quiz
          </button>
        </div>

        {/* Main Dashboard Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 24,
          marginBottom: 48
        }}>
          {/* Your Profile Card */}
          <DashboardCard
            icon="👤"
            title="Your Profile"
            description="Details from your initial assessment"
            onClick={() => console.log("Your Profile clicked")}
          />

          {/* Nutrition Plan Card */}
          <DashboardCard
            icon="🍽️"
            title="Your Nutrition Plan"
            description="AI-generated macro and calorie goals based on your profile"
            onClick={() => console.log("Nutrition Plan clicked")}
          />

          {/* Today's Intake Card */}
          <DashboardCard
            icon="📈"
            title="Today's Intake"
            description="Monitor consumed meals and nutritional breakdown"
            onClick={() => console.log("Today's Intake clicked")}
          />

          {/* NutriScore Report Card */}
          <DashboardCard
            icon="⭐"
            title="NutriScore Report"
            description="Comprehensive nutrition analysis with actionable insights"
            onClick={() => console.log("NutriScore clicked")}
          />

          {/* Recommended Recipes Card */}
          <DashboardCard
            icon="🍲"
            title="Recommended Recipes"
            description="Personalized meal suggestions to meet your nutritional goals"
            onClick={() => console.log("Recommended Recipes clicked")}
          />
        </div>

        {/* Quick Actions Section */}
        <div style={{
          background: "linear-gradient(135deg, #2a2a30 0%, #1f1f24 100%)",
          borderRadius: 20,
          padding: 32,
          border: "1px solid #333",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#fff" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowQuiz(true)}
              style={primaryButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Retake Quiz
            </button>
            <button
              style={secondaryButtonStyle}
              onClick={() => console.log("Download Report clicked")}
              onMouseOver={e => { e.currentTarget.style.background = "#ff9000"; e.currentTarget.style.color = "#000"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff9000"; }}
            >
              Download Full Report
            </button>
          </div>
        </div>
      </div>
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} />}
    </div>
  );
};

export default App;
