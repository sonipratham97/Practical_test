import { BrowserRouter as Router, Route, Routes, Link ,Navigate} from "react-router-dom";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <nav className="p-3 bg-white shadow-sm w-100 d-flex justify-content-center gap-3">
          <Link to="/customer-register" className="btn btn-primary">
            Customer Register
          </Link>
          <Link to="/admin-register" className="btn btn-secondary">
            Admin Register
          </Link>
          <Link to="/admin-login" className="btn btn-dark">
            Admin Login
          </Link>
        </nav>
        <div
          className="container mt-4 p-4 bg-white shadow rounded"
          style={{ maxWidth: "400px" }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/customer-register" />} />
            <Route
              path="/customer-register"
              element={<Register role="customer" />}
            />
            <Route path="/admin-register" element={<Register role="admin" />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
