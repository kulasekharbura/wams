import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administrator");
  const { login } = useAuth();
  const navigate = useNavigate();

  // UPDATE your handleLogin function inside Login.jsx
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Call the Express backend we just built!
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend sends an error (like wrong password), alert the user
        alert(data.message);
        return;
      }

      // 2. If successful, update the global context with REAL database user data
      login(data);

      // 3. Route the user based on their validated role
      switch (data.role) {
        case "Administrator":
          navigate("/admin");
          break;
        case "Dealer":
          navigate("/dealer");
          break;
        case "Inventory Manager":
          navigate("/inventory");
          break;
        case "Supplier":
          navigate("/supplier");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>WAMS System Login</h2>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Simulate Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="Administrator">Administrator</option>
            <option value="Dealer">Dealer</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Supplier">Supplier</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "0.75rem", cursor: "pointer" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
