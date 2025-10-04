import React, { useState, useEffect, useContext } from "react"; 
import { AuthContext } from "./AuthContext";

export default function Classes() {
  const { user, authFetch, loading } = useContext(AuthContext);

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [form, setForm] = useState({
    course_id: "",
    name: "",
    scheduled_time: "",
    venue: "",
    total_registered: "",
    lecturer_id: "",
  });
  const [fetching, setFetching] = useState(false);
  // Fetch classes
const fetchClasses = async () => {
  setFetching(true);
  try {
    // Always use the same route; backend handles filtering
    const data = await authFetch("http://localhost:5000/api/classes");
    setClasses(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error fetching classes:", err.message);
    setClasses([]);
  } finally {
    setFetching(false);
  }
};


  // Fetch courses & lecturers (PL only)
  const fetchCourses = async () => {
    try {
      const data = await authFetch("http://localhost:5000/api/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    }
  };

  const fetchLecturers = async () => {
    try {
      const data = await authFetch("http://localhost:5000/api/users?role=lecturer");
      setLecturers(Array.isArray(data) ? data : []);
    } catch {
      setLecturers([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchClasses();
    if (user.role === "pl") {
      fetchCourses();
      fetchLecturers();
    }
  }, [user]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await authFetch("http://localhost:5000/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    // Add the new class to state immediately
    setClasses(prev => [...prev, data.class]);

    // Reset the form
    setForm({
      course_id: "",
      name: "",
      scheduled_time: "",
      venue: "",
      total_registered: "",
      lecturer_id: "",
    });
  } catch (err) {
    alert("Failed to add class: " + err.message);
  }
};


  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view classes.</p>;

  return (
    <main className="classes-container">
      {user.role === "pl" && (
        <div className="form-card">
          <h2>Add Class & Assign Lecturer</h2>
          <form onSubmit={handleSubmit}>
            <select
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              placeholder="Class Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Scheduled Time"
              value={form.scheduled_time}
              onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
            />
            <input
              placeholder="Venue"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
            <input
              type="number"
              placeholder="Total Registered"
              value={form.total_registered}
              onChange={(e) => setForm({ ...form, total_registered: e.target.value })}
            />

            <select
              value={form.lecturer_id}
              onChange={(e) => setForm({ ...form, lecturer_id: e.target.value })}
              required
            >
              <option value="">-- Assign Lecturer --</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <button className="btn">Add Class & Assign</button>
          </form>
        </div>
      )}

      <div className="list-card">
        <h2>{user.role === "lecturer" ? "My Classes" : "All Classes"}</h2>
        {fetching ? (
          <p>Loading classes...</p>
        ) : classes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Course</th>
                <th>Code</th>
                {user.role === "pl" && <th>Lecturer</th>}
                <th>Time</th>
                <th>Venue</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
  {classes.map((cl) => (
    <tr key={cl.id}>
      <td>{cl.name}</td>
      <td>{cl.course_name}</td>
      <td>{cl.course_code}</td>
      {user.role === "pl" && (
        <td>{cl.lecturer_name ? cl.lecturer_name : "Unassigned"}</td>
      )}
      <td>{cl.scheduled_time || "-"}</td>
      <td>{cl.venue || "-"}</td>
      <td>{cl.total_registered || 0}</td>
    </tr>
  ))}
</tbody>
          </table>
        ) : (
          <p>No classes found.</p>
        )}
      </div>
    </main>
  );
}
