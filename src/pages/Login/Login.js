import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./Login.module.css";
import { FiLock, FiMail } from "react-icons/fi";
import { useToast } from "../../components/toast/ToastContext";
import axios from "axios";
import { useEffect } from "react";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorShake, setErrorShake] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });
            const { access_token, user } = res.data.data;
            localStorage.setItem("adminToken", access_token);
            localStorage.setItem("adminUser", JSON.stringify(user));
            showToast("Login successful", "success");
            navigate("/dashboard");
        }
        catch (error) {
            setErrorShake(true);
            setLoading(false);
            setTimeout(() => {
                setErrorShake(false);
            }, 600);
            if (axios.isAxiosError(error)) {
                showToast(error.response?.data?.message ||
                    "Invalid credentials. Please try again.", "error");
            }
            else {
                showToast("Something went wrong. Please try again.", "error");
            }
        }
    };
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.backgroundAnimation, children: [_jsx("div", { className: styles.gradientOrb1 }), _jsx("div", { className: styles.gradientOrb2 }), _jsx("div", { className: styles.gradientOrb3 })] }), _jsx("div", { className: styles.geometricPattern, children: Array.from({ length: 50 }).map((_, i) => (_jsx("div", { className: styles.geometricShape }, i))) }), _jsx("div", { className: styles.particles, children: Array.from({ length: 30 }).map((_, i) => (_jsx("span", { className: styles.particle }, i))) }), _jsxs("div", { className: styles.contentWrapper, children: [_jsxs("div", { className: styles.brandSection, children: [_jsx("div", { className: styles.logoContainer, children: _jsx("div", { className: styles.logoGlow, children: _jsx("img", { src: "/raheeb-logo.jpg", alt: "RAHEEB Logo", className: styles.logo }) }) }), _jsxs("div", { className: styles.brandContent, children: [_jsxs("h1", { className: styles.brandTitle, children: [_jsx("span", { className: styles.raheeb, children: "RAHEEB" }), _jsx("span", { className: styles.adminText, children: "Admin Portal" })] }), _jsx("p", { className: styles.brandSubtitle, children: "Premium Administrative Control Center" })] })] }), _jsxs("div", { className: styles.formSection, children: [_jsxs("form", { className: `${styles.loginCard} ${errorShake ? styles.shake : ""}`, onSubmit: handleSubmit, "data-testid": "login-form", children: [_jsxs("div", { className: styles.formHeader, children: [_jsx("div", { className: styles.formIconWrapper, children: _jsx(FiLock, { className: styles.formIcon }) }), _jsx("h2", { children: "Administrator Login" }), _jsx("p", { className: styles.formSubtext, children: "Enter your credentials to access the system" })] }), _jsxs("div", { className: styles.inputGroup, children: [_jsxs("label", { htmlFor: "email", children: [_jsx(FiMail, { className: styles.inputIcon }), "Email Address"] }), _jsx("input", { id: "email", type: "email", placeholder: "Enter your email address", value: email, onChange: (e) => setEmail(e.target.value), required: true, "data-testid": "login-email-input", className: styles.input })] }), _jsxs("div", { className: styles.inputGroup, children: [_jsxs("label", { htmlFor: "password", children: [_jsx(FiLock, { className: styles.inputIcon }), "Password"] }), _jsx("input", { id: "password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true, "data-testid": "login-password-input", className: styles.input })] }), _jsx("button", { type: "submit", disabled: loading, "data-testid": "login-submit-button", className: styles.submitButton, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: styles.spinner }), "Authenticating..."] })) : (_jsxs(_Fragment, { children: [_jsx(FiLock, { className: styles.buttonIcon }), "Secure Login"] })) }), _jsxs("div", { className: styles.secureNotice, children: [_jsx("div", { className: styles.secureIcon, children: _jsx(FiLock, {}) }), _jsx("span", { children: "Protected by enterprise-grade security" })] })] }), _jsx("div", { className: styles.decorativeCircle1 }), _jsx("div", { className: styles.decorativeCircle2 })] })] })] }));
}
