import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading dashboard...</p>;
  if (!user) return <p>Please log in to access the dashboard.</p>;

  return (
    <main>
      <div className="card">
        <h2>OVERVIEW - {user.role.toUpperCase()}</h2>
        <div className="btn-group">
          {user.role === "pl" && (
            <>
              <Link className="btn" to="/courses">Manage Courses</Link>
              <Link className="btn" to="/classes">Manage Classes</Link>
            </>
          )}
          {user.role === "lecturer" && (
            <>
              <Link className="btn" to="/classes">My Classes</Link>
              <Link className="btn" to="/reports">My Reports</Link>
            </>
          )}
          {user.role === "prl" && (
            <Link className="btn" to="/reports">Review Reports</Link>
          )}
          {user.role === "student" && (
            <p>Students can rate or monitor (to be added).</p>
          )}
        </div>
      </div>
    </main>
  );
}
