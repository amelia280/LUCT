import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // <-- wait for AuthContext
  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <h3>Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
