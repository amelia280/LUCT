import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function Reports() {
  const { user, authFetch, loading } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    class_name: "",
    topic_taught: "",
    actual_students_present: ""
  });
  const [feedbacks, setFeedbacks] = useState({});

  // Fetch reports
  const fetchReports = async () => {
    try {
      const data = await authFetch("http://localhost:5000/api/reports");
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reports:", err.message);
      setReports([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchReports();
  }, [user]);

  // Submit report (lecturer)
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await authFetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ class_name: "", topic_taught: "", actual_students_present: "" });
      fetchReports();
    } catch (err) {
      alert("Error submitting report: " + err.message);
    }
  };

  // Submit feedback (PRL)
  const handleFeedback = async (id) => {
    try {
      await authFetch(`http://localhost:5000/api/reports/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbacks[id], status: "reviewed" }),
      });
      setFeedbacks(prev => ({ ...prev, [id]: "" }));
      fetchReports();
    } catch (err) {
      alert("Error submitting feedback: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view reports.</p>;

  return (
    <main className="reports-container">
      {/* Lecturer Form */}
      {user.role === "lecturer" && (
        <div className="form-card">
          <h2>Submit Report</h2>
          <form onSubmit={handleSubmitReport}>
            <input
              placeholder="Class Name"
              value={form.class_name}
              onChange={e => setForm({ ...form, class_name: e.target.value })}
              required
            />

            <input
              placeholder="Topic Taught"
              value={form.topic_taught}
              onChange={e => setForm({ ...form, topic_taught: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Actual Students Present"
              value={form.actual_students_present}
              onChange={e => setForm({ ...form, actual_students_present: e.target.value })}
              required
            />

            <button className="btn">Submit Report</button>
          </form>
        </div>
      )}

      {/* Reports Table */}
      <div className="table-card">
        <h2>Reports</h2>
        {reports.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Class</th>
                <th>Topic Taught</th>
                <th>Students Present</th>
                <th>Status</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.class_name}</td>
                  <td>{r.topic_taught}</td>
                  <td>{r.actual_students_present}</td>
                  <td>{r.status}</td>
                  <td>
                    {user.role === "prl" ? (
                      <>
                        <input
                          value={feedbacks[r.id] || ""}
                          onChange={e => setFeedbacks(prev => ({ ...prev, [r.id]: e.target.value }))}
                        />
                        <button className="btn" onClick={() => handleFeedback(r.id)}>Submit</button>
                      </>
                    ) : r.prl_feedback || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reports yet.</p>
        )}
      </div>
    </main>
  );
}
