import { useState } from "react";
import axios from "axios";

const Register = ({ role }) => {
    const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "" });
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
        if (!formData.first_name.trim()) errors.first_name = "First Name is required";
        if (!formData.last_name.trim()) errors.last_name = "Last Name is required";
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Invalid email format";
        if (formData.password.length < 6) errors.password = "Password must be at least 6 characters long";

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
            await axios.post("http://localhost:5000/api/auth/register", { ...formData, role });
            alert("Registration successful! Check your email for verification.");
            setFormData({ first_name: "", last_name: "", email: "", password: "" }); // Reset form
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="container mt-3">
            <h2 className="text-center">{role === "admin" ? "Admin" : "Customer"} Registration</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="p-3 shadow-sm bg-white rounded">
                <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        className={`form-control ${validationErrors.first_name ? "is-invalid" : ""}`}
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    {validationErrors.first_name && <div className="invalid-feedback">{validationErrors.first_name}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        className={`form-control ${validationErrors.last_name ? "is-invalid" : ""}`}
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                    {validationErrors.last_name && <div className="invalid-feedback">{validationErrors.last_name}</div>}
                </div>
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
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default Register;
