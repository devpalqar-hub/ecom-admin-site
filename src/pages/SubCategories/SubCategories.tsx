import styles from "./SubCategories.module.css";
import { FiPlus, FiSearch, FiMoreVertical } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string | null;
  category?: Category;
}

/* ================= COMPONENT ================= */

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ================= FETCH API ================= */
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await api.get("/subcategories", {
          params: {
            search: search || undefined,
          },
        });

        setSubCategories(res.data.data.data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [search]);

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Subcategories</h1>
          <p>Manage product subcategories</p>
        </div>

        <button
            className={styles.addBtn}
            onClick={() => navigate("/subcategories/add")}
            >
            <FiPlus /> Add Subcategory
        </button>
      </div>

      {/* FILTER */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading subcategories...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {subCategories.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.name}</td>
                  <td>{sub.description ?? "-"}</td>
                  <td>{sub.category?.name ?? "-"}</td>
                  <td className={styles.actions}>
                    <FiMoreVertical />
                  </td>
                </tr>
              ))}

              {subCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    No subcategories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* MOBILE CARDS */}
<div className={styles.mobileList}>
  {subCategories.map((sub) => (
    <div key={sub.id} className={styles.mobileCard}>
      <div className={styles.cardHeader}>
        <h4>{sub.name}</h4>
        <FiMoreVertical className={styles.actions} />
      </div>

      <div className={styles.cardRow}>
        <span>Description</span>
        <p>{sub.description ?? "-"}</p>
      </div>

      <div className={styles.cardRow}>
        <span>Category</span>
        <strong>{sub.category?.name ?? "-"}</strong>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
