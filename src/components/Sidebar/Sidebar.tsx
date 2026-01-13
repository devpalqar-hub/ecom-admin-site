import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiLayers
} from "react-icons/fi";


export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button (mobile only via CSS) */}
      <button
        className={`${styles.hamburger} ${open ? styles.active : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Overlay */}
      <div
        className={`${styles.sidebarOverlay} ${
          open ? styles.active : ""
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.avatar}>R</div>
          <div>
            <h4>Raheeb Admin</h4>
            <span>E-commerce Panel</span>
          </div>
        </div>

        {/* Menu */}
        <nav className={styles.menu}>
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="/Products" onClick={() => setOpen(false)}>
            <FiBox /> Products
          </NavLink>

          <NavLink to="/Orders" onClick={() => setOpen(false)}>
            <FiShoppingCart /> Orders
          </NavLink>

          <NavLink to="/customers" onClick={() => setOpen(false)}>
            <FiUsers /> Customers
          </NavLink>

          <NavLink to="/financial" onClick={() => setOpen(false)}>
            <FiDollarSign /> Financial
          </NavLink>

          <NavLink to="/Categories" onClick={() => setOpen(false)}>
            <FiTag /> Categories
          </NavLink>
          <NavLink to="/subcategories" onClick={() => setOpen(false)}>
            <FiLayers />Subcategories    
          </NavLink>

        </nav>
      </aside>
    </>
  );
}
