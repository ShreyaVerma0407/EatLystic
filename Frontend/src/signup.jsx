// Signup.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
const EMAIL_BASE_URL = API_BASE_URL.replace("/api", "");
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
try {
  const response = await axios.post(`${EMAIL_BASE_URL}/register`, {
    name: name.trim(),
    email: email.trim(),
    password,
  });

  if (response.data.status === "success") {
    const userId = response.data.data._id;
    localStorage.setItem("userId", userId); // persist user ID
    localStorage.setItem("user", JSON.stringify(response.data.data)); // persist user object
    alert(response.data.message);
    navigate("/welcome"); // redirect after registration
  } else {
    alert(response.data.message || "Registration failed");
  }
} catch (err) {
  console.error(err);
  alert("Server error. Please try again later.");
}

  };

  return (
    <div className="auth-container">
      <div className="wave-bg"></div>
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label><strong>Name</strong></label>
            <input
              type="text"
              placeholder="Enter Name"
              autoComplete="off"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label><strong>Email</strong></label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label><strong>Password</strong></label>
            <input
              type="password"
              placeholder="Enter Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form>

        <p className="mt-3" style={{ color: "black" }}>
  Already have an account?
</p>

        <Link
          to="/login"
          className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none custom-btn"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;
