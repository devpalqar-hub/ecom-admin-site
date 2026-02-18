import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logout } from "@/utils/logout";

export default function MobileLogin() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    localStorage.setItem("adminToken", token);

    window.history.replaceState({}, document.title, "/mobile-auth");

    navigate("/dashboard", { replace: true });

  }, [token, navigate]);

  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <h2>Opening dashboard...</h2>
    </div>
  );
}
