import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditProduct.module.css";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data.data;

        setName(product.name);
        setDiscountedPrice(product.discountedPrice);

        const mainImage =
          product.images?.find((img: any) => img.isMain)?.url ||
          product.images?.[0]?.url;

        if (mainImage) {
          setPreview(mainImage);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  /* ---------------- IMAGE CHANGE ---------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  /* ---------------- SUBMIT UPDATE ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("discountedPrice", discountedPrice);

      if (imageFile) {
        formData.append("images", imageFile);
      }

      await api.patch(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product updated successfully");
      navigate(-1);
    } catch (error: any) {
      console.error("Update failed", error?.response?.data || error);
      alert("Failed to update product");
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading product...</p>;
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div>
          <h1>Edit Product</h1>
          <p>Update product details</p>
        </div>
      </div>

      {/* CARD */}
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* IMAGE UPLOAD */}
          <label className={styles.uploadBox}>
            <FiUpload size={22} />
            <span>Upload product image</span>
            <input
              type="file"
              accept="image/*"
              hidden
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
            <label>Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Headphones"
            />
          </div>

          {/* DISCOUNTED PRICE */}
          <div className={styles.field}>
            <label>Discounted Price *</label>
            <input
              type="number"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="e.g. 1499"
            />
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.save}>
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
