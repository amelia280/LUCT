import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import logo from "../Assets/LimkoS.jpg";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      {/* Left: Brand */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">LUCT Reporting</Link>
      </div>

      {/* Center: Logo */}
      <div className="navbar-center">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {/* Right: Links */}
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name} ({user.role})</span>
            <button onClick={logout} className="btn btn-sm btn-danger ms-2">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-success me-2">Login</Link>
            <Link to="/register" className="btn btn-sm btn-success">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
