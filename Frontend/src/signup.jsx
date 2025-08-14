import { useState } from "react";
import axios from "axios";
import Welcome from "./Components/Welcome";  // Import the Welcome component
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // Track registration success

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.data.status === "success") {
        alert(response.data.message);
        setRegistrationSuccess(true); // Set success to true to render Welcome page
      } else {
        alert(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  // If registration is successful, render the Welcome component
  if (registrationSuccess) {
    return <Welcome />;
  }

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

        <p className="mt-3">Already have an account?</p>
        <button
          onClick={() => window.location.href = "/login"} // Simulate navigation to login page
          className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Signup;
