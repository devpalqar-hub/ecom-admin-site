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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error: unknown) {
        setErrorShake(true);
        setLoading(false);

        setTimeout(() => {
          setErrorShake(false);
        }, 600);

        if (axios.isAxiosError(error)) {
          showToast(
            error.response?.data?.message ||
              "Invalid credentials. Please try again.",
            "error"
          );
        } else {
          showToast("Something went wrong. Please try again.", "error");
        }
      }

  };

  return (
    <div className={styles.page}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className={styles.geometricPattern}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={styles.geometricShape} />
        ))}
      </div>

      {/* Floating Golden Particles */}
      <div className={styles.particles}>
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className={styles.particle} />
        ))}
      </div>

      {/* Main Content Container */}
      <div className={styles.contentWrapper}>
        {/* Left Side - Branding */}
        <div className={styles.brandSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoGlow}>
              <img 
                src="/raheeb-logo.jpg" 
                alt="RAHEEB Logo" 
                className={styles.logo}
              />
            </div>
          </div>

          <div className={styles.brandContent}>
            <h1 className={styles.brandTitle}>
              <span className={styles.raheeb}>RAHEEB</span>
              <span className={styles.adminText}>Admin Portal</span>
            </h1>
            
            <p className={styles.brandSubtitle}>
              Premium Administrative Control Center
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formSection}>
          <form
            className={`${styles.loginCard} ${
              errorShake ? styles.shake : ""
            }`}
            onSubmit={handleSubmit}
            data-testid="login-form"
          >
            <div className={styles.formHeader}>
              <div className={styles.formIconWrapper}>
                <FiLock className={styles.formIcon} />
              </div>
              <h2>Administrator Login</h2>
              <p className={styles.formSubtext}>
                Enter your credentials to access the system
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">
                <FiMail className={styles.inputIcon} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">
                <FiLock className={styles.inputIcon} />
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password-input"
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              data-testid="login-submit-button"
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <FiLock className={styles.buttonIcon} />
                  Secure Login
                </>
              )}
            </button>

            <div className={styles.secureNotice}>
              <div className={styles.secureIcon}>
                <FiLock />
              </div>
              <span>Protected by enterprise-grade security</span>
            </div>
          </form>

          {/* Decorative Elements */}
          <div className={styles.decorativeCircle1}></div>
          <div className={styles.decorativeCircle2}></div>
        </div>
      </div>
    </div>
  );
}
