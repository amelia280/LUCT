import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function Ratings() {
  const { authFetch, user, loading } = useContext(AuthContext);
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [form, setForm] = useState({ target_id: "", module: "", score: "", comment: "" });

  // Fetch lecturers (for students & PRL)
  const fetchLecturers = async () => {
    try {
      const data = await authFetch("/api/users?role=lecturer");
      setLecturers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch lecturers:", err.message);
    }
  };

  // Fetch ratings for selected lecturer
  const fetchRatings = async (targetId) => {
    if (!targetId) return setRatings([]);
    try {
      const data = await authFetch(`/api/ratings/target/${targetId}`);
      setRatings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ratings:", err.message);
      setRatings([]);
    }
  };

  useEffect(() => {
    if (user) fetchLecturers();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ target_id: "", module: "", score: "", comment: "" });
      fetchRatings(form.target_id);
    } catch (err) {
      alert("Failed to submit rating: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to access ratings.</p>;

  return (
    <main className="classes-container">
      <div className="form-card">
        <h2>Submit Rating</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={form.target_id}
            onChange={e => {
              setForm({ ...form, target_id: e.target.value });
              fetchRatings(e.target.value);
            }}
            required
          >
            <option value="">Select Lecturer</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <input
            placeholder="Module Name"
            value={form.module}
            onChange={e => setForm({ ...form, module: e.target.value })}
            required
          />

          <input
            type="number"
            min="1"
            max="5"
            placeholder="Score (1-5)"
            value={form.score}
            onChange={e => setForm({ ...form, score: e.target.value })}
            required
          />

          <textarea
            placeholder="Comment"
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
          />

          <button className="btn">Submit Rating</button>
        </form>
      </div>

      {ratings.length > 0 && (
        <div className="table-card">
          <h2>Ratings for Selected Lecturer</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Rater</th>
                <th>Module</th>
                <th>Score</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.rater_name}</td>
                  <td>{r.module}</td>
                  <td>{r.score}</td>
                  <td>{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
