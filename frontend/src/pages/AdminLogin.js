import { useState } from "react";
import axios from "axios";

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationErrors({ ...validationErrors, [e.target.name]: "" }); // Clear errors on input
    };

    // Validate fields before submission
    const validate = () => {
        let errors = {};
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Invalid email format";
        if (!formData.password.trim()) errors.password = "Password is required";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validate()) return; // Stop if validation fails

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/auth/admin-login", formData);
            localStorage.setItem("token", response.data.token);
            alert("Login successful!");
        } catch (error) {
            setError(error.response?.data?.message || "Invalid credentials");
        }
        setLoading(false);
    };

    return (
        <div className="container mt-3">
            <h2 className="text-center">Admin Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="p-3 shadow-sm bg-white rounded">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {validationErrors.email && <div className="invalid-feedback">{validationErrors.email}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {validationErrors.password && <div className="invalid-feedback">{validationErrors.password}</div>}
                </div>
                <button type="submit" className="btn btn-dark w-100" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
