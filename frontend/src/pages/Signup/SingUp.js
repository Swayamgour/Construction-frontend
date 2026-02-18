import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

const Signup = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/dashboard");
        console.log(form);
        // API call yahan hoga
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.signupCard}>
                <h2 className={styles.signupTitle}>Create Your ERP Account</h2>
                <p className={styles.signupSubtitle}>
                    Please fill the details to get started.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select your role</option>
                            <option value="admin">Admin</option>
                            <option value="vendor">Vendor</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.signupBtn}>
                        Sign Up
                    </button>
                </form>

                <p className={styles.signupFooter}>
                    Already have an account?{" "}
                    {/* <a href="/" onClick={() => navigate("/")}>
                        Login
                    </a> */}

                    <button onClick={() => navigate("/")}>
                        Login
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="ml-2">
                        Dashboard
                    </button>
                </p>

                <p className={styles.login_footer}>
                    © 2025 Construction ERP. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Signup;
