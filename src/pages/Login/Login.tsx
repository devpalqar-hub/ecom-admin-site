import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password, // must match backend exactly
      });

      const { access_token, user } = res.data.data;

      // store auth data
      localStorage.setItem("adminToken", access_token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      // ✅ go to dashboard ONLY after login
      navigate("/dashboard");
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* LEFT SECTION */}
    
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logo}>R</div>
          <h1>Raheeb Admin Panel</h1>
          <p className={styles.subtitle}>
            Secure administrative access for system management.
          </p>

          <ul className={styles.features}>
            <li>✔ Centralized Control</li>
            <li>✔ Real-time Monitoring</li>
          </ul>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className={styles.right}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <p className={styles.loginText}>
            Enter your admin credentials to continue
          </p>

          <label>Email Address</label>
          <input
            type="email"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className={styles.secure}>
            🔒 Admin access is securely encrypted
          </div>
        </form>
      </div>
    </div>
  
  );
}
