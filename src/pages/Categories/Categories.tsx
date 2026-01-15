import styles from "./Categories.module.css";
import { FiPlus, FiSearch,FiEdit2, FiTrash2} from "react-icons/fi";
import { FiBox, FiGrid } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean | null;
  subCategories?: SubCategory[] | null;
  image?: string | null;
}

/* ================= COMPONENT ================= */

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const page = 1;
  const limit = 10;

  /* ================= FETCH API ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await api.get("/categories", {
          params: {
            page,
            limit,
            search: search || undefined,
          },
        });

        setCategories(res.data.data.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [search]);

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Categories",
      value: categories.length,
      variant: "total",
      icon: <FiGrid />,
    },
    {
      title: "Active Categories",
      value: categories.filter((c) => c.isActive ?? true).length,
      variant: "processing",
      icon: <FiBox />,
    },
    {
      title: "Total Subcategories",
      value: categories.reduce(
        (sum, c) => sum + (c.subCategories?.length ?? 0),
        0
      ),
      variant: "shipped",
      icon: <FiBox />,
    },
  ];
  // delete api //
  const handleDeleteCategory = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/categories/${id}`);

    // remove deleted category from UI immediately
    setCategories((prev) => prev.filter((c) => c.id !== id));

    alert("Category deleted successfully");
  } catch (error: any) {
    console.error("Failed to delete category", error?.response?.data || error);
    alert("Failed to delete category");
  }
};


  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Organize and manage product categories</p>
        </div>

        <button
          className={styles.addBtn}
          onClick={() => navigate("/categories/add")}
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        {stats.map((s) => (
          <div
            key={s.title}
            className={`${styles.statCard} ${styles[s.variant]}`}
          >
            <div>
              <span>{s.title}</span>
              <h3>{s.value}</h3>
            </div>
            <div className={styles.statIcon}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className={styles.searchBar}>
        <FiSearch />
        <input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE (DESKTOP) */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading categories...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Description</th>
                <th>SubCategory</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  {/* IMAGE */}
                  <td className={styles.imageCell}>
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className={styles.categoryImage}
                      />
                    ) : (
                      <span className={styles.noImage}>—</span>
                    )}
                  </td>

                  <td className={styles.categoryCell}>
                    <strong>{c.name}</strong>
                  </td>

                  <td className={styles.desc}>{c.description ?? "-"}</td>

                  <td>{c.subCategories?.length ?? 0}</td>

                  <td>
                    <span
                      className={
                        (c.isActive ?? true)
                          ? styles.active
                          : styles.inactive
                      }
                    >
                      {(c.isActive ?? true) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => navigate(`/categories/edit/${c.id}`)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteCategory(c.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className={styles.mobileList}>
        {categories.map((c) => (
          <div key={c.id} className={styles.mobileCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className={styles.mobileImage}
                  />
                ) : (
                  <div className={styles.mobileImagePlaceholder} />
                )}
                <strong>{c.name}</strong>
              </div>

              <span
                className={
                  (c.isActive ?? true) ? styles.active : styles.inactive
                }
              >
                {(c.isActive ?? true) ? "Active" : "Inactive"}
              </span>
            </div>

            <p className={styles.cardDesc}>{c.description ?? "-"}</p>

            <div className={styles.cardRow}>
              <span>Subcategories</span>
              <strong>{c.subCategories?.length ?? 0}</strong>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.editBtn}
                onClick={() => navigate(`/categories/edit/${c.id}`)}
              >
                <FiEdit2 />
              </button>

              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteCategory(c.id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
