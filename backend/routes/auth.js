const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const transporter = require("../config/mailer");

const router = express.Router();

// Generate email verification token
const generateToken = (email) => jwt.sign({ email }, "practical@123", { expiresIn: "1h" });

// Registration Route with Validation
router.post(
    "/register",
    [
        body("first_name").notEmpty().withMessage("First name is required"),
        body("last_name").notEmpty().withMessage("Last name is required"),
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("role").isIn(["customer", "admin"]).withMessage("Invalid role"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { first_name, last_name, email, password, role } = req.body;

        try {
            // Check if email already exists
            db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
                if (err) return res.status(500).json({ message: "Database error" });

                if (results.length > 0) {
                    return res.status(400).json({ message: "Email already registered" });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                const token = generateToken(email);

                // Insert new user
                db.query(
                    "INSERT INTO users (first_name, last_name, email, password, role, verified) VALUES (?, ?, ?, ?, ?, ?)",
                    [first_name, last_name, email, hashedPassword, role, 0],
                    (err, results) => {
                        if (err) return res.status(500).json({ message: "Database error" });

                        // Send verification email
                        const verifyLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;
                        transporter.sendMail({
                            to: email,
                            subject: "Verify Your Email",
                            html: `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
                        });

                        res.status(200).json({ message: "Registration successful! Check your email to verify your account." });
                    }
                );
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
        }
    }
);

// Email verification route
router.get("/verify-email", (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, "practical@123");
        db.query("UPDATE users SET verified = 1 WHERE email = ?", [decoded.email], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.send("Email verified successfully. You can now log in.");
        });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

// Admin Login Route with Validation
router.post(
    "/admin-login",
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length === 0 || results[0].role !== "admin") {
                return res.status(403).json({ message: "You are not allowed to login from here" });
            }

            if (!results[0].verified) {
                return res.status(401).json({ message: "Please verify your email before logging in" });
            }

            const validPassword = await bcrypt.compare(password, results[0].password);
            if (!validPassword) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: results[0].id, role: results[0].role }, "practcal@123", { expiresIn: "1h" });
            res.json({ token });
        });
    }
);

module.exports = router;
