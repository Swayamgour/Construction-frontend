import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import style from "./Login.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation, useCheckLoginQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(""); // 👈 ROLE STATE
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const [login, result] = useLoginMutation();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password ) {
            toast.error("⚠️ Please fill all fields including role!");
            return;
        }

        login({ email, password, role }); // 👈 Role also sent
    };

    useEffect(() => {
        if (result?.isSuccess && result?.data?.token) {
            toast.success("🎉 Login Successful!");
            localStorage.setItem("token", result?.data?.token);
            navigate("/dashboard");
        }

        if (result?.isError) {
            toast.error(result?.error?.data?.message || "❌ Incorrect Credentials");
        }
    }, [result, navigate]);

    const token = localStorage.getItem("token");
    const { data, isLoading, isError } = useCheckLoginQuery();

    if (token && isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg font-medium">
                Checking authentication...
            </div>
        );
    }

    if (token && isError) {
        localStorage.removeItem("token");
    }

    if (data) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className={style.login_container}>
            <div className={style.login_card}>
                <div className="flex justify-center">

                    <img src="/logoss.png" alt='company logo' width={60} height={60} />
                </div>
                <h2 className={style.login_title}>Construction ERP Login</h2>
                <p className={style.login_subtitle}>Welcome back! Please sign in to continue.</p>

                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className={style.form_group}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                  


                    {/* Password + Eye Toggle */}
                    <div className={`${style.form_group} ${style.password_wrapper}`}>
                        <label>Password</label>
                        <div className={style.password_input_container}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className={style.eye_btn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* <div className={style.form_group}>
                        <label>Select Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div> */}

                    <button type="submit" className={style.login_btn}>{result?.isLoading ? "Loading..." : "Login"}</button>
                </form>

                {/* <p className={style.signupFooter}>
                    Don't have an account?
                    <button onClick={() => navigate("/signup")} className={style.signup_btn}>
                        Sign Up
                    </button>
                </p> */}

                <p className={style.login_footer}>© 2025  SS Construction ERP. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Login;
