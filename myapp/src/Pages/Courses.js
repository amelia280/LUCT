import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function Courses() {
  const { user, authFetch, loading } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", faculty: "", code: "" });

  const faculties = [
    "Communication Media & Broadcasting",
    "Business Management and Globalization",
    "Design and Innovation",
    "Architecture and the Built Environment",
    "Information and Communication Technology",
    "Fashion and Lifestyle Design",
  ];

  const fetchCourses = async () => {
    try {
      const data = await authFetch("http://localhost:5000/api/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch courses error:", err.message);
      setCourses([]);
    }
  };

  useEffect(() => {
    if (user?.role === "pl") fetchCourses();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authFetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", faculty: "", code: "" });
      fetchCourses();
    } catch (err) {
      alert("Failed to add course: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user || user.role !== "pl") return <p>Access denied.</p>;

  return (
    <main className="classes-container">
      <div className="form-card">
        <h2>Add Course</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Course Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            required
          >
            <option value="">-- Select Faculty --</option>
            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input
            placeholder="Course Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <button className="btn">Add Course</button>
        </form>
      </div>

      <div className="list-card">
        <h2>Courses</h2>
        {courses.length > 0 ? (
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Name</th>
                <th>Faculty</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.faculty}</td>
                  <td>{c.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No courses found</p>}
      </div>
    </main>
  );
}
