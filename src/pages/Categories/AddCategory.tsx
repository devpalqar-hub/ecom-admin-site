import styles from "./AddCategory.module.css";
import { useState } from "react";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
import api from "../../services/api";

export default function AddCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleImageChange = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", generateSlug(name));
    formData.append("description", description);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Category created successfully", "success");
      navigate("/categories");
    } catch (err: any) {
      showToast("Failed to create category", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/categories")}
        >
          <FiArrowLeft />
        </button>

        <div>
          <h1>Add Category</h1>
          <p>Create a new product category</p>
        </div>
      </div>

      {/* FORM */}
      <div className={styles.card}>
        {/* IMAGE UPLOAD */}
        <div className={styles.imageUpload}>
          {!preview ? (
            <label className={styles.uploadBox}>
              <FiUpload size={22} />
              <span>Upload category image</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files && handleImageChange(e.target.files[0])
                }
              />
            </label>
          ) : (
            <div className={styles.previewBox}>
              <img src={preview} alt="Preview" />
              <button
                className={styles.removeImage}
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
              >
                <FiX />
              </button>
            </div>
          )}
        </div>

        {/* NAME */}
        <div className={styles.field}>
          <label>Category Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Accessories"
          />
        </div>

        {/* DESCRIPTION */}
        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={() => navigate("/categories")}
          >
            Cancel
          </button>

          <button
            className={styles.primary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
