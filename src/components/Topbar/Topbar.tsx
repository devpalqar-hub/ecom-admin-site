import styles from "./Topbar.module.css";
import { FiSearch, FiBell,FiLogOut } from "react-icons/fi";
import {useNavigate} from "react-router-dom";
export default function Topbar() {
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <header className={styles.topbar}>
        <div className={styles.topbarContent}>
      {/* LEFT: SEARCH */}
      <div className={styles.search}>
        <FiSearch />
        <input placeholder="Search products, orders, customers..." />
      </div>

      {/* RIGHT SIDE */}
<div className={styles.rightActions}>
  <div className={styles.bell}>
    <FiBell />
    <span className={styles.dot}></span>
  </div>

  <div className={styles.logout}>
    <button onClick={handleLogout}>
      <FiLogOut />
      Logout
    </button>
  </div>
</div>
</div>
    </header>
  );
}
