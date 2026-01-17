import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditCategory.module.css";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH CATEGORY ================= */

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/categories/${id}`);
        const category = res.data.data;

        setName(category.name || "");
        setDescription(category.description || "");
        setPreview(category.image || null);
      } catch (error) {
        console.error("Failed to fetch category", error);
        alert("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  /* ================= IMAGE CHANGE ================= */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  /* ================= IMAGE REMOVE ================= */

  const handleRemoveImage = () => {
    setPreview(null);
    setImageFile(null);
    setRemoveImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ================= UPDATE CATEGORY ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (removeImage) {
        formData.append("removeImage", "true");
      }

      await api.patch(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Category updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading category...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          type="button"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
        </button>

        <div>
          <h1>Edit Category</h1>
          <p>Update category details</p>
        </div>
      </div>

      {/* FORM */}
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* IMAGE UPLOAD */}
          <label className={styles.uploadBox}>
            <FiUpload />
            <span>Upload category image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>

          {/* IMAGE PREVIEW */}
          {preview && (
  <div className={styles.imageCard}>
    <img src={preview} alt="Subcategory preview" />

    <button
      type="button"
      className={styles.imageRemove}
      onClick={handleRemoveImage}
      title="Remove image"
    >
      ×
    </button>
  </div>
)}

          {/* NAME */}
          <div className={styles.field}>
            <label>Category Name *</label>
            <input
              type="text"
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

            <button
              type="submit"
              className={styles.save}
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
