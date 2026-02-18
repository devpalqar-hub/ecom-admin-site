import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MobileLogin() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // store token
    localStorage.setItem("adminToken", token);

    // remove token from URL (VERY IMPORTANT)
    window.history.replaceState({}, document.title, "/mobile-auth");

    // go to dashboard
    navigate("/dashboard", { replace: true });

  }, [token, navigate]);

  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <h2>Opening dashboard...</h2>
    </div>
  );
}
