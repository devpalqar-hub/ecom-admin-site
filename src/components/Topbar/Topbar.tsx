import styles from "./Topbar.module.css";
import {FiLogOut } from "react-icons/fi";
import {useNavigate} from "react-router-dom";
import ConfirmModal from "../confirmModal/ConfirmModal";
import { useState } from "react";

export default function Topbar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <>
    <header className={styles.topbar}>
        <div className={styles.topbarContent}>

        <div className={styles.logout}>
          <button onClick={() => setShowConfirm(true)}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>
    </header>
    <ConfirmModal 
      open={showConfirm}
      title="Logout"
      message="Are you sure you want to logout?"
      confirmText="Logout"
      onCancel={() => setShowConfirm(false)}
      onConfirm={handleLogout}
    />
    </>
  );
}
