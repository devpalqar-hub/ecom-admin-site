import styles from "./SubCategories.module.css";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  category?: Category;
}

/* ================= COMPONENT ================= */

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast(); 
  /* ================= FETCH API ================= */
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);

        const res = await api.get("/subcategories", {
          params: {
            search: search || undefined,
          },
        });

        setSubCategories(res.data.data.data ?? []);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [search]);

  /* ================= DELETE ================= */
  const handleDeleteSubCategory = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );
    if (!confirmed) 
      return;

    try {
      await api.delete(`/subcategories/${id}`);
      setSubCategories((prev) => prev.filter((s) => s.id !== id));
      showToast("Subcategory deleted successfully", "success");
    } catch (error: any) {
      console.error("Delete failed", error?.response?.data || error);
      showToast("Failed to delete subcategory", "error");
    }
  };

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

      {/* SEARCH */}
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

      {/* TABLE (DESKTOP) */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading subcategories...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {subCategories.map((sub) => (
                <tr key={sub.id}>
                  {/* IMAGE */}
                  <td className={styles.imageCell}>
                    {sub.image ? (
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className={styles.subImage}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <span className={styles.noImage}>—</span>
                    )}
                  </td>

                  <td>{sub.name}</td>
                  <td>{sub.description ?? "-"}</td>
                  <td>{sub.category?.name ?? "-"}</td>

                  {/* ACTIONS */}
                  <td className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() =>
                        navigate(`/subcategories/edit/${sub.id}`)
                      }
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteSubCategory(sub.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}

              {subCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
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
              <div className={styles.cardLeft}>
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className={styles.mobileImage}
                  />
                ) : (
                  <div className={styles.mobileImagePlaceholder} />
                )}
                <h4>{sub.name}</h4>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() =>
                    navigate(`/subcategories/edit/${sub.id}`)
                  }
                >
                  <FiEdit2 />
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteSubCategory(sub.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
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
