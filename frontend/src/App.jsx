import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Complaint from "./pages/Complaint";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import StaffComplaints from "./pages/StaffComplaints";

function Home() {
  return (
    <div>
      <h1>AI-Powered Complaint Management System</h1>

      <p>
        Submit, track, and manage college complaints easily.
      </p>

      <Link to="/login">
        <button>Login</button>
      </Link>

      <Link to="/register">
        <button>Register</button>
      </Link>
<Link to="/dashboard">
  <button>Dashboard</button>
</Link>

<Link to="/complaint">
  <button>Submit Complaint</button>
</Link>

<Link to="/my-complaints">
  <button>My Complaints</button>
</Link>

<Link to="/admin-complaints">
  <button>Admin Complaints</button>
</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/admin-complaints" element={<AdminComplaints />} />
        <Route path="/staff-complaints" element={<StaffComplaints />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;