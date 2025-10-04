import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Pages/Navbar";
import { AuthProvider, AuthContext } from "./Pages/AuthContext";
import PrivateRoute from "./Pages/PrivateRoute";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Courses from "./Pages/Courses";
import Reports from "./Pages/Reports";
import Classes from "./Pages/Classes";
import Ratings from "./Pages/Ratings";
import './App.css';
import { useContext } from "react";

function AppRoutes() {
  const { loading } = useContext(AuthContext);

  if (loading) return <p>Loading application...</p>; // <-- wait for user

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<PrivateRoute roles={["pl"]}><Courses /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute roles={["lecturer", "prl"]}><Reports /></PrivateRoute>} />
        <Route path="/classes" element={<PrivateRoute roles={["pl", "lecturer"]}><Classes /></PrivateRoute>} />
        <Route path="/ratings" element={<PrivateRoute roles={["student", "lecturer", "prl", "pl"]}><Ratings /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
