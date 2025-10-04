import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    faculty: "",
    role: "student",
  });

  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Registration failed");

    alert("Registered successfully, now login.");
    navigate("/login");
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
      React.createElement("h2", null, "Register"),
      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement("input", {
          placeholder: "Name",
          value: form.name,
          onChange: (e) => setForm({ ...form, name: e.target.value }),
          required: true,
        }),
        React.createElement("input", {
          placeholder: "Email",
          value: form.email,
          onChange: (e) => setForm({ ...form, email: e.target.value }),
          required: true,
        }),
        React.createElement("input", {
          type: "password",
          placeholder: "Password",
          value: form.password,
          onChange: (e) => setForm({ ...form, password: e.target.value }),
          required: true,
        }),
        React.createElement(
          "select",
          {
            value: form.faculty,
            onChange: (e) => setForm({ ...form, faculty: e.target.value }),
            required: true,
          },
          React.createElement("option", { value: "" }, "-- Select Faculty --"),
          React.createElement(
            "option",
            { value: "Communication Media & Broadcasting" },
            "Communication Media & Broadcasting"
          ),
          React.createElement(
            "option",
            { value: "Business Management and Globalization" },
            "Business Management and Globalization"
          ),
          React.createElement(
            "option",
            { value: "Design and Innovation" },
            "Design and Innovation"
          ),
          React.createElement(
            "option",
            { value: "Architecture and the Built Environment" },
            "Architecture and the Built Environment"
          ),
          React.createElement(
            "option",
            { value: "Information and Communication Technology" },
            "Information and Communication Technology"
          ),
          React.createElement(
            "option",
            { value: "Fashion and Lifestyle Design" },
            "Fashion and Lifestyle Design"
          )
        ),
        React.createElement(
          "select",
          {
            value: form.role,
            onChange: (e) => setForm({ ...form, role: e.target.value }),
          },
          React.createElement("option", { value: "student" }, "Student"),
          React.createElement("option", { value: "lecturer" }, "Lecturer"),
          React.createElement("option", { value: "prl" }, "PRL"),
          React.createElement("option", { value: "pl" }, "PL")
        ),
        React.createElement("button", { className: "btn" }, "Register")
      )
    )
  );
} 