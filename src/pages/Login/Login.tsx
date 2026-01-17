import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./Login.module.css";
import { FiLock } from "react-icons/fi";
import { useToast } from "../../components/toast/ToastContext";
import { FaGlobe, FaRegEye } from "react-icons/fa6";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
      showToast("Login successfull", "success")

      navigate("/dashboard");
    }  catch (error: any) {
  setErrorShake(true);

  setTimeout(() => {
    setErrorShake(false);
  }, 600);

  showToast(
    error?.response?.data?.message ||
    "Invalid credentials. Please try again.", "error"
  );
}

  };

  return (
    <div className={styles.page}>

    
      <div className={styles.left}>
        <div className={styles.particles}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className={styles.brand}>
          <div className={styles.logo}>R</div>
          <h1 className={styles.head}><span>RAHEEB</span> Admin Panel</h1>
          <p className={styles.subtitle}>
            Secure administrative access for system management.
          </p>

          <ul className={styles.features}>
            <li className={styles.globe}><FaGlobe size={20}/> Centralized Control</li>
            <li className={styles.eye}><FaRegEye/> Real-time Monitoring</li>
          </ul>
        </div>
      </div>


      <div className={styles.right}>
        <form
          className={`${styles.card} ${
            errorShake ? styles.shake : ""
          }`}
          onSubmit={handleSubmit}
        >
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

          <div
            className={`${styles.secure} ${
              loading ? styles.secureLoading : ""
            }`}
          >
            <FiLock className={styles.lockIcon} />
            <span>Secure admin access</span>
          </div>

        </form>
      </div>
    </div>
  
  );
}
