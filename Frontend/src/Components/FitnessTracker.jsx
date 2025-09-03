// src/pages/FitnessTracker.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FaVenusMars,FaBirthdayCake, FaWeight, FaBed, FaTint, FaBolt, FaHeartbeat, FaDrumstickBite, FaBreadSlice, FaPizzaSlice, FaLeaf, FaFire } from "react-icons/fa";
import { MdFitnessCenter, MdOutlineHeight } from "react-icons/md";
import 'react-circular-progressbar/dist/styles.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NUTRIENTS = ["protein_g", "fat_total_g", "carbohydrates_total_g", "fiber_g"];
const HEART_RATE_BASE = 70;
const DISEASES = [
  { name: "None", tdeeFactor: 1, heartRateAdjust: 0, recommendation: "" },
  { name: "Diabetes", tdeeFactor: 0.95, heartRateAdjust: 0, recommendation: "Limit sugar and simple carbs" },
  { name: "Hypertension", tdeeFactor: 0.95, heartRateAdjust: 5, recommendation: "Reduce salt intake" },
  { name: "Obesity", tdeeFactor: 0.85, heartRateAdjust: 10, recommendation: "Focus on low-calorie, high-protein foods" },
  { name: "Heart Disease", tdeeFactor: 0.90, heartRateAdjust: 8, recommendation: "Monitor heart rate, avoid heavy exertion" },
  { name: "Thyroid", tdeeFactor: 1.0, heartRateAdjust: 5, recommendation: "Balance diet to support thyroid function" },
  { name: "Anemia", tdeeFactor: 1.0, heartRateAdjust: 3, recommendation: "Increase iron-rich foods" }
];
const nutrientIcons = {
  calories: "/images/calories.png",
  protein: "/images/protein.png",
  fat_total: "/images/lipid.png",
  carbohydrates_total: "/images/carb.png",
  fiber: "/images/food.png",
};



// ------------------ Color Palette ------------------
const colors = {
  bgCard: "rgba(255, 255, 255, 0.15)",
  nutrientLow: "#28C76F",
  nutrientHigh: "#EA5455",
  nutrientOptimal: "#FF9F43",
  progressTrail: "rgba(255,255,255,0.25)",
  progressText: "#fff",
  button: "#00CFE8",
  buttonHover: "#0095A8",
};

const cardStyle = {
  background: `rgba(0, 0, 0, 0.35)`,
  padding: 25,
  borderRadius: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  marginBottom: 30,
  //backdropFilter: "blur(1px)", // reduced blur
  color: "#fff",
};



const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.6)",
  outline: "none",
  minWidth: 140,
  background: "rgba(0,0,0,0.4)",   // darker bg for readability
  color: "#fff",                   // entered text stays white
  fontWeight: "bold",
  transition: "0.3s all",
};


const buttonStyle = {
  padding: "12px 30px",
  borderRadius: 10,
  border: "none",
  backgroundColor: colors.button,
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
  transition: "0.3s all",
};

const buttonHoverStyle = {
  backgroundColor: colors.buttonHover,
};

// ------------------ Heart Rate ------------------
const HeartRate = ({ rate, disease }) => {
  const warning = (rate > HEART_RATE_BASE + 30) && disease !== "None" ? ` ⚠ High` : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `10px solid rgba(255, 99, 132, 0.5)`, // softer red border
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          background: "linear-gradient(135deg, rgba(255,99,132,0.15), rgba(0,207,232,0.15))", // gradient
          boxShadow: "0 0 20px rgba(0, 207, 232, 0.4)", // glowing effect
        }}
      >
        <span
  style={{
    fontWeight: "bold",
    color: warning ? "#FF4C4C" : "#00E0B8",
    fontSize: 24,
    textAlign: "center",
    display: "block"
  }}
>
  {rate} bpm{warning}
</span>

      </motion.div>
      <p style={{ marginTop: 10, fontWeight: "bold", color: "#E0E0E0" }}>Estimated Heart Rate</p>
    </div>
  );
};

// ------------------ Recommendations ------------------
const Recommendations = ({ getNutrientStatus, getCalorieStatus, disease, heartRate, idealIntake, exerciseRecs }) => {
  const recs = [];

  NUTRIENTS.forEach((n) => {
    const status = getNutrientStatus(n);
    if (status === "Low") recs.push({ text: `Increase ${n.replace("_g","")}-rich foods`, icon: "🍽️", color: colors.nutrientLow });
    if (status === "High") recs.push({ text: `Reduce ${n.replace("_g","")}-rich foods`, icon: "⚠️", color: colors.nutrientHigh });
  });

  const calorieStatus = getCalorieStatus();
  if (calorieStatus === "Low") recs.push({ text: "Increase overall calorie intake", icon: "🍽️", color: colors.nutrientLow });
  if (calorieStatus === "High") recs.push({ text: "Reduce overall calorie intake", icon: "⚠️", color: colors.nutrientHigh });

  const diseaseObj = DISEASES.find(d => d.name === disease);
  if(diseaseObj?.recommendation) recs.push({ text: diseaseObj.recommendation, icon: "⚠️", color: colors.nutrientHigh });

  if (heartRate && idealIntake) {
    const rate = heartRate;
    const base = HEART_RATE_BASE + (diseaseObj?.heartRateAdjust || 0);
    if (rate > base + 25) recs.push({ text: "Heart rate elevated", icon: "❤️‍🔥", color: colors.nutrientHigh });
    else if (rate < base + 10) recs.push({ text: "Heart rate low — consider light activity", icon: "🏃", color: colors.nutrientOptimal });
    else recs.push({ text: "Heart rate normal", icon: "✅", color: colors.nutrientOptimal });
  }

  exerciseRecs.forEach(r => recs.push({ text: r, icon: "🏋️", color: colors.nutrientOptimal }));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", marginTop: 20 }}>
      {recs.map((r, idx) => (
        <motion.div
          key={idx}
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.1 * idx }}
          style={{
            borderRadius: 20,
            padding: "20px 15px",
            minWidth: 160,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            background: `linear-gradient(145deg, ${r.color}33, ${r.color}22)`,
            border: `1px solid ${r.color}`,
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          <span style={{ fontSize: 36 }}>{r.icon}</span>
          <span style={{ fontSize: 14 }}>{r.text}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ------------------ Main Component ------------------
const FitnessTracker = () => {
  const userId = localStorage.getItem("userId");

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [disease, setDisease] = useState("None");

  const [bmi, setBmi] = useState(null);
  const [idealIntake, setIdealIntake] = useState(null);

  const [consumedData, setConsumedData] = useState([]);
  const [consumedCalories, setConsumedCalories] = useState(0);

  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [energy, setEnergy] = useState("");
  const [exerciseRecs, setExerciseRecs] = useState([]);

  // inside FitnessTracker component

const handleSubmit = async () => {
  if (!age || !gender || !height || !weight) return alert("Fill all fields");

  const heightM = height / 100;
  const bmiVal = weight / (heightM * heightM);
  setBmi(bmiVal.toFixed(1));

  let bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityFactors = { low: 1.2, moderate: 1.55, high: 1.725 };
  let tdee = bmr * (activityFactors[activity] || 1.55);

  const diseaseObj = DISEASES.find((d) => d.name === disease);
  tdee *= diseaseObj?.tdeeFactor || 1;

  const proteinCalories = tdee * 0.2;
  const fatCalories = tdee * 0.25;
  const carbCalories = tdee * 0.55;

  const intake = {
    calories: Math.round(tdee),
    protein_g: parseFloat((proteinCalories / 4).toFixed(1)),
    fat_total_g: parseFloat((fatCalories / 9).toFixed(1)),
    carbohydrates_total_g: parseFloat((carbCalories / 4).toFixed(1)),
    fiber_g: 25,
  };
  setIdealIntake(intake);

  const exerciseRecsTemp = [];
  if (sleep && Number(sleep) < 6) exerciseRecsTemp.push("Get at least 7 hours sleep 🛌");
  if (water && Number(water) < 2) exerciseRecsTemp.push("Drink more water 💧");
  if (energy === "low") exerciseRecsTemp.push("Do light cardio or stretching 🏃‍♂️");
  else if (energy === "moderate") exerciseRecsTemp.push("Moderate exercises like jogging or cycling 🚴‍♂️");
  else if (energy === "high") exerciseRecsTemp.push("Strength training or HIIT 💪");
  setExerciseRecs(exerciseRecsTemp);

const fullRecs = [];

  // Nutrient recommendations
  NUTRIENTS.forEach((n) => {
    const consumed = consumedData.reduce((sum, item) => sum + (item.nutrients[n] || 0), 0);
    const ideal = intake[n];
    if (consumed < 0.9 * ideal) fullRecs.push(`Increase ${n.replace("_g", "")}-rich foods`);
    else if (consumed > 1.1 * ideal) fullRecs.push(`Reduce ${n.replace("_g", "")}-rich foods`);
  });

  // Calorie recommendations
  if (consumedCalories < 0.9 * intake.calories) fullRecs.push("Increase overall calorie intake");
  else if (consumedCalories > 1.1 * intake.calories) fullRecs.push("Reduce overall calorie intake");

  // Disease recommendations
  if (diseaseObj?.recommendation) fullRecs.push(diseaseObj.recommendation);

  // Exercise / lifestyle recommendations
  fullRecs.push(...exerciseRecsTemp);

let heartRateVal = Math.round(
  HEART_RATE_BASE + ((consumedCalories / intake.calories) * 30)
);
heartRateVal += diseaseObj?.heartRateAdjust || 0;

  // ✅ Send data to backend
  try {
    const res = await axios.post(`${API_BASE_URL}/fitness/save`, {
      userId,
      age,
      gender,
      height,
      weight,
      activity,
      disease,
      sleep,
      water,
      energy,
      bmi: bmiVal.toFixed(1),
      idealIntake: intake,
      consumedCalories,
      heartRate: heartRateVal,
      recommendations: fullRecs,
    });

    alert(res.data.message);
  } catch (err) {
    alert(err.response?.data?.message || "Error submitting data ❌");
  }
};

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE_URL}/consumed/user/${userId}`)
      .then(res => { if (res.data.status === "success") setConsumedData(res.data.data); })
      .catch(err => console.error(err));

    axios.get(`${API_BASE_URL}/consumption/aggregate?userId=${userId}&interval=daily`)
      .then(res => {
        if (res.data.status === "success") {
          const total = res.data.data.reduce((sum, entry) => sum + entry.calories, 0);
          setConsumedCalories(total);
        }
      })
      .catch(err => console.error(err));
  }, [userId]);

  const getTotalConsumed = (nutrient) =>
    consumedData.reduce((sum, item) => sum + (item.nutrients[nutrient] || 0), 0);

  const getNutrientStatus = (nutrient) => {
    if (!idealIntake) return "-";
    const consumed = getTotalConsumed(nutrient);
    const ideal = idealIntake[nutrient];
    if (consumed < 0.9 * ideal) return "Low";
    if (consumed > 1.1 * ideal) return "High";
    return "Optimal";
  };

  const getCalorieStatus = () => {
    if (!idealIntake) return "-";
    if (consumedCalories < 0.9 * idealIntake.calories) return "Low";
    if (consumedCalories > 1.1 * idealIntake.calories) return "High";
    return "Optimal";
  };

  const getHeartRate = () => {
    if (!idealIntake) return "-";
    let rate = Math.round(HEART_RATE_BASE + ((consumedCalories / idealIntake.calories) * 30));
    const diseaseObj = DISEASES.find(d => d.name === disease);
    rate += diseaseObj?.heartRateAdjust || 0;
    return rate;
  };

  const nutrientsData = [
    { name: "Calories", consumed: consumedCalories, ideal: idealIntake?.calories },
    ...NUTRIENTS.map(n => ({ name: n.replace("_g", ""), consumed: parseFloat(getTotalConsumed(n).toFixed(1)), ideal: idealIntake ? idealIntake[n] : 0 }))
  ];

  return (
    <>
      <Navbar />
     <div
  style={{
    padding: "120px 20px",
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/images/yogabg.jpg")`,
    backgroundSize: "cover",         // fills screen
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    backgroundAttachment: "fixed",   // keeps visible on scroll
  }}
>


        {/* User Details + Exercise Q&A */}
       {/* User Details + Exercise Q&A */}
<div style={cardStyle}>
 <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
  <img
    src="/images/weight.png"
    alt="Weight Training"
    style={{ width: "40px", height: "40px" }}
  />
  Fitness Profile & Daily Check-in
</h2>

  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>

    {/* Age */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaBirthdayCake/>
      <input
        style={inputStyle}
        placeholder="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />
    </div>

    {/* Gender */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaVenusMars />
      <select style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    </div>

    {/* Height */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <MdOutlineHeight />
      <input
        style={inputStyle}
        placeholder="Height (cm)"
        type="number"
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
      />
    </div>

    {/* Weight */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaWeight />
      <input
        style={inputStyle}
        placeholder="Weight (kg)"
        type="number"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
      />
    </div>

    {/* Activity */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <MdFitnessCenter />
      <select style={inputStyle} value={activity} onChange={(e) => setActivity(e.target.value)}>
        <option value="low">Low Activity</option>
        <option value="moderate">Moderate Activity</option>
        <option value="high">High Activity</option>
      </select>
    </div>

    {/* Disease */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaHeartbeat />
      <select style={inputStyle} value={disease} onChange={(e) => setDisease(e.target.value)}>
        {DISEASES.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
      </select>
    </div>

    {/* Sleep */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaBed />
      <input
        style={inputStyle}
        placeholder="Sleep Hours"
        type="number"
        value={sleep}
        onChange={(e) => setSleep(e.target.value)}
      />
    </div>

    {/* Water */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaTint />
      <input
        style={inputStyle}
        placeholder="Water Intake (L)"
        type="number"
        value={water}
        onChange={(e) => setWater(e.target.value)}
      />
    </div>

    {/* Energy */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <FaBolt />
      <select style={inputStyle} value={energy} onChange={(e) => setEnergy(e.target.value)}>
        <option value="">Energy Level</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
      </select>
    </div>

  </div>

  {/* Submit */}
  <div style={{ marginTop: 20 }}>
    <button
      style={buttonStyle}
      onMouseOver={e => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
      onMouseOut={e => e.currentTarget.style.backgroundColor = colors.button}
      onClick={handleSubmit}
    >
      Submit
    </button>
  </div>

  {bmi && <p style={{ marginTop: 10 }}>Your BMI: <b>{bmi}</b></p>}
</div>


        {/* Nutrient & Calorie Table */}
        {idealIntake && (
          <div style={{ ...cardStyle, textAlign: "center" }}>
              <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
  <img
    src="/images/lotus.png"
    alt="Weight Training"
    style={{ width: "40px", height: "40px" }}
  />
 Nutrient & Calorie Status
</h2>

        <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 15,
    color: "#fff",
  }}
>
  <thead>
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
      <th
        style={{
          padding: 10,
          textAlign: "left", // 👈 left align Nutrient col

        }}
      >
        <img
          src="/images/minerals.png"
          alt="Nutrient Icon"
          width="30"
          height="30"
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
        Nutrient
      </th>

      <th style={{ padding: 10, textAlign: "center" }}>
        <img
          src="/images/consumer-behavior.png"
          alt="Consumed Icon"
          width="30"
          height="30"
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
        Consumed
      </th>

      <th style={{ padding: 10, textAlign: "center" }}>
        <img
          src="/images/success.png"
          alt="Ideal Icon"
          width="30"
          height="30"
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
        Ideal
      </th>

      <th style={{ padding: 10, textAlign: "center" }}>
        <img
          src="/images/full-battery.png"
          alt="Status Icon"
          width="30"
          height="30"
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
        Status
      </th>
    </tr>
  </thead>

  <tbody>
    {nutrientsData.map((n, idx) => {
      const status =
        n.name === "Calories"
          ? getCalorieStatus()
          : getNutrientStatus(n.name.toLowerCase() + "_g");

      const key = n.name.toLowerCase();

      return (
        <tr
          key={idx}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
        >
          {/* Nutrient column: left aligned */}
          <td
            style={{
              padding: "10px 0",
    textAlign: "left",

            }}
          >
            <img
              src={nutrientIcons[key] || "/images/default.png"}
              alt={n.name}
              width={20}
              height={20}
              style={{ marginRight: "8px" }}
            />
            {n.name}
          </td>

          {/* Other columns: center aligned */}
          <td style={{ padding: 10, textAlign: "center" }}>{n.consumed}</td>
          <td style={{ padding: 10, textAlign: "center" }}>{n.ideal}</td>
          <td
            style={{
              padding: 10,
              textAlign: "center",
              color:
                status === "Low"
                  ? colors.nutrientLow
                  : status === "High"
                  ? colors.nutrientHigh
                  : colors.nutrientOptimal,
            }}
          >
            {status}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

          </div>
        )}

        {/* Circular Speedometers */}
        {idealIntake && (
          <div style={{ ...cardStyle, textAlign: "center" }}>
               <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
  <img
    src="/images/extended.png"
    alt="Weight Training"
    style={{ width: "40px", height: "40px" }}
  />
Nutrient Progress
</h2>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, marginTop: 20 }}>
              {nutrientsData.map((n, idx) => {
                const consumedPercent = n.ideal ? Math.min(100, (n.consumed / n.ideal) * 100) : 0;
                return (
                  <div key={idx} style={{ width: 120, textAlign: "center" }}>
                    <CircularProgressbar
                      value={consumedPercent}
                      text={`${Math.round(consumedPercent)}%`}
                      styles={buildStyles({
                        textColor: "#fff",
                        pathColor: consumedPercent < 90 ? colors.nutrientLow : consumedPercent > 110 ? colors.nutrientHigh : colors.nutrientOptimal,
                        trailColor: colors.progressTrail
                      })}
                    />
                    <p style={{ marginTop: 8 }}>{n.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {idealIntake && (
          <div style={{ ...cardStyle, height: 350 }}>
                 <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
  <img
    src="/images/exercise.png"
    alt="Weight Training"
    style={{ width: "40px", height: "40px" }}
  />
Nutrient Comparison
</h2>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={nutrientsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" fill={colors.nutrientLow} />
                <Bar dataKey="ideal" fill={colors.nutrientOptimal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Heart Rate */}
        {idealIntake && <HeartRate rate={getHeartRate()} disease={disease} />}

        {/* Recommendations */}
        {idealIntake && (
          <Recommendations
            getNutrientStatus={getNutrientStatus}
            getCalorieStatus={getCalorieStatus}
            disease={disease}
            heartRate={getHeartRate()}
            idealIntake={idealIntake}
            exerciseRecs={exerciseRecs}
          />
        )}
      </div>
    </>
  );
};

export default FitnessTracker;