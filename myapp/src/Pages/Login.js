import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save user + token in context
      login(data.user, data.token);

     navigate("/");


    } catch (err) {
      alert(err.message);
    }
  };

  return React.createElement(
    "main",
    { className: "auth-container" },
    React.createElement(
      "div",
      { className: "form-card" },
      React.createElement("h2", null, "Login"),
      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement("input", {
          placeholder: "Email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true,
        }),
        React.createElement("input", {
          type: "password",
          placeholder: "Password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
        }),
        React.createElement("button", { className: "btn" }, "Login")
      )
    )
  );
}
