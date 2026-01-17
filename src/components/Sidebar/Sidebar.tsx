import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiTag,
  FiLayers,
  FiGift,
  FiImage
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
          <NavLink to="/dashboard" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }
          onClick={() => setOpen(false)}>
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="/Products" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }
          onClick={() => setOpen(false)}>
            <FiBox /> Products
          </NavLink>

          <NavLink to="/coupons" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiGift /> Coupons
          </NavLink>

          <NavLink to="/Orders" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiShoppingCart /> Orders
          </NavLink>

          <NavLink to="/customers" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiUsers /> Customers
          </NavLink>

          <NavLink to="/banners" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiImage /> Banners
          </NavLink>

          <NavLink to="/Categories" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiTag /> Categories
          </NavLink>
          <NavLink to="/subcategories" 
          className={({ isActive }) => 
            `${styles.item} ${isActive ? styles.active : " "}`
          }          
          onClick={() => setOpen(false)}>
            <FiLayers />Subcategories    
          </NavLink>

        </nav>
      </aside>
    </>
  );
}
