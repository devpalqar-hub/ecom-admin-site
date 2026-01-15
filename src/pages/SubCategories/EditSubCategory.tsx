import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditSubCategory.module.css";
import { useToast } from "../../components/toast/ToastContext";
/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}

export default function EditSubCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [subRes, catRes] = await Promise.all([
          api.get(`/subcategories/${id}`),
          api.get("/categories"),
        ]);

        const sub = subRes.data.data;

        setName(sub.name);
        setDescription(sub.description ?? "");
        setCategoryId(sub.categoryId ?? "");
        setPreview(sub.image ?? null);
        setCategories(catRes.data.data.data);
      } catch (error) {
        console.error("Failed to load subcategory", error);
        showToast("Failed to load subcategory", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("categoryId", categoryId);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.patch(`/subcategories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Subcategory updated successfully", "success");
      navigate(-1);
    } catch (error: any) {
      console.error("Update failed", error?.response?.data || error);
      showToast("Failed to update subcategory", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading subcategory...</p>;
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div>
          <h1>Edit Subcategory</h1>
          <p>Update subcategory details</p>
        </div>
      </div>

      {/* FORM */}
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* IMAGE UPLOAD */}
          <label className={styles.uploadBox}>
            <FiUpload />
            <span>Upload subcategory image</span>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {preview && (
            <div className={styles.preview}>
              <img src={preview} alt="Preview" />
            </div>
          )}

          {/* NAME */}
          <div className={styles.field}>
            <label>Subcategory Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* CATEGORY */}
          <div className={styles.field}>
            <label>Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? "Updating..." : "Update Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
