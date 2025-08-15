import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email: email.trim(),
        password,
      });

      if (response.data.status === "success") {
        alert(response.data.message);
        navigate("/home");
      } else {
        alert(response.data.message || "Invalid email or password");
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
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
            Login
          </button>
        </form>

        <p className="mt-3">Don't have an account?</p>
        <Link
          to="/register"
          className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Login;

