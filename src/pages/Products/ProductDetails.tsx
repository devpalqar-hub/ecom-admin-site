import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./ProductDetails.module.css";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";

/* ================= TYPES ================= */

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  discountedPrice: string;
  actualPrice: string;
  stockCount: number;
  isStock: boolean;
  isFeatured: boolean;
  createdAt: string;
  images: { id: string; url: string; isMain?: boolean }[];
  subCategory?: {
    name: string;
    category?: {
      name: string;
      image?: string;
    };
  };
  reviews?: Review[];
}

/* ================= COMPONENT ================= */

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error("Failed to load product details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  /* ================= SET DEFAULT IMAGE ================= */

  useEffect(() => {
    if (product?.images?.length) {
      const main =
        product.images.find((i) => i.isMain)?.url ||
        product.images[0].url;

      setSelectedImage(main);
    }
  }, [product]);

  /* ================= REVIEW UPDATE ================= */

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      setSaving(true);

      await api.patch(`/reviews/${editingReview.id}`, {
        rating: editRating,
        comment: editComment,
      });

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews?.map((r) =>
                r.id === editingReview.id
                  ? { ...r, rating: editRating, comment: editComment }
                  : r
              ),
            }
          : prev
      );

      setEditingReview(null);
    } catch (error) {
      console.error("Failed to update review", error);
      alert("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  /* ================= REVIEW DELETE ================= */

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/reviews/${reviewId}`);

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews?.filter((r) => r.id !== reviewId),
            }
          : prev
      );
    } catch (error) {
      console.error("Failed to delete review", error);
      alert("Failed to delete review");
    }
  };

  /* ================= STATES ================= */

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  /* ================= UI ================= */

  return (
<div className={styles.page}>
  {/* BACK */}
  <button className={styles.backBtn} onClick={() => navigate("/products")}>
    <FiArrowLeft /> Back
  </button>

  {/* PRODUCT LAYOUT */}
  <div className={styles.productLayout}>
    {/* IMAGE GALLERY */}
    <div className={styles.imageGallery}>
      <div className={styles.mainImage}>
        <img
          src={selectedImage || "/placeholder.png"}
          alt={product.name}
        />
      </div>

      <div className={styles.thumbnailWrapper}>
        <div className={styles.thumbnailRow}>
          {product.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt="Thumbnail"
              className={
                img.url === selectedImage
                  ? styles.activeThumb
                  : styles.thumb
              }
              onClick={() => setSelectedImage(img.url)}
            />
          ))}
        </div>
      </div>
    </div>

    {/* PRODUCT DETAILS (RIGHT SIDE) */}
    <div className={styles.productInfo}>
      <h2>{product.name}</h2>

      <div className={styles.meta}>
        <span className={styles.badge}>
          Category: {product.subCategory?.category?.name || "-"}
        </span>
        <span className={styles.badge}>
          Subcategory: {product.subCategory?.name || "-"}
        </span>
        <span
          className={product.isStock ? styles.inStock : styles.outStock}
        >
          {product.isStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <p className={styles.price}>
        ₹{product.discountedPrice}
        <span>₹{product.actualPrice}</span>
      </p>

      <p className={styles.desc}>{product.description}</p>

      <p className={styles.stock}>
        Stock Available: <strong>{product.stockCount}</strong>
      </p>

      <div className={styles.extraInfo}>
        <p>
          Featured:
          <strong>{product.isFeatured ? " Yes" : " No"}</strong>
        </p>
        <p>
          Created On:
          <strong>
            {" "}
            {new Date(product.createdAt).toLocaleDateString()}
          </strong>
        </p>
      </div>
    </div>
  </div>
      {/* ================= REVIEWS ================= */}
      <h3 className={styles.reviewTitle}>Customer Reviews</h3>

      <div className={styles.reviewGrid}>
        {product.reviews?.length === 0 && <p>No reviews yet</p>}

        {product.reviews?.map((r) => (
          <div key={r.id} className={styles.reviewCard}>
            <div className={styles.reviewTop}>
              <div className={styles.avatar}>
                {r.user?.name?.charAt(0).toUpperCase() || "A"}
              </div>

              <div className={styles.userBlock}>
                <strong>{r.user?.name || "Anonymous"}</strong>
                <span className={styles.date}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.stars}>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
            </div>

            <p className={styles.comment}>{r.comment}</p>

            <div className={styles.reviewActions}>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  setEditingReview(r);
                  setEditRating(r.rating);
                  setEditComment(r.comment);
                }}
              >
                <FiEdit2 />
              </button>

              <button
                className={`${styles.iconBtn} ${styles.delete}`}
                onClick={() => handleDeleteReview(r.id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT REVIEW MODAL ================= */}
      {editingReview && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Review</h3>

            <label>Rating</label>
            <select
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n > 1 && "s"}
                </option>
              ))}
            </select>

            <label>Comment</label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={4}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setEditingReview(null)}
              >
                Cancel
              </button>

              <button
                className={styles.saveBtn}
                onClick={handleUpdateReview}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
