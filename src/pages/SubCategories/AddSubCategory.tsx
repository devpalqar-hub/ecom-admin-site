import styles from "./AddSubCategory.module.css";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}
/* ================= COMPONENT ================= */

export default function AddSubCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- slug helper ---------- */
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  /* ---------- fetch categories ---------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data?.data?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) {
      alert("Subcategory name and category are required");
      return;
    }

    const payload = {
      name,
      slug: generateSlug(name),
      description,
      categoryId,
    };

    try {
      setLoading(true);
      await api.post("/subcategories", payload);

      alert("Subcategory created successfully");
      navigate("/subcategories");
    } catch (err: any) {
      console.error("Create subcategory failed", err?.response?.data || err);
      alert("Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/subcategories")}
        >
          <FiArrowLeft />
        </button>

        <div>
          <h1>Add SubCategory</h1>
          <p>Create a new subcategory</p>
        </div>
      </div>

      {/* FORM */}
      <div className={styles.card}>
        <div className={styles.field}>
          <label>SubCategory Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shirts"
          />
        </div>

        <div className={styles.field}>
          <label>Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={() => navigate("/subcategories")}
          >
            Cancel
          </button>

          <button
            className={styles.primary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create SubCategory"}
          </button>
        </div>
      </div>
    </div>
  );
}
