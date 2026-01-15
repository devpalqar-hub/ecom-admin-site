import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./ProductDetails.module.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

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
  images: { url: string; isMain?: boolean }[];
  subCategory?: {
    name: string;
    category?: {
      name: string;
      image?: string;
    };
  };
  reviews?: Review[];
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      [key: string]: number;
    };
  };
}

/* ================= COMPONENT ================= */

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
 const [editingReview, setEditingReview] = useState<Review | null>(null);
const [editRating, setEditRating] = useState(0);
const [editComment, setEditComment] = useState("");
const [saving, setSaving] = useState(false);

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
/* ================= UPDATE REVIEW ================= */

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      setSaving(true);
    console.log("1",editingReview.id)
      await api.patch(`/reviews/${editingReview.id}`, {
        rating: editRating,
        comment: editComment,
      });

      // Update review in UI
      setProduct((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          reviews: prev.reviews?.map((r) =>
            r.id === editingReview.id
              ? { ...r, rating: editRating, comment: editComment }
              : r
          ),
        };
      });

      setEditingReview(null);
    } catch (error) {
      console.error("Failed to update review", error);
      alert("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  
  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  const mainImage =
    product.images?.find((i) => i.isMain)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";
 const handleDeleteReview = async (reviewId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this review?"
  );
  if (!confirmed) return;

  try {
    await api.delete(`/reviews/${reviewId}`);

    // Remove review from UI immediately
    setProduct((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        reviews: prev.reviews?.filter(
          (r) => r.id !== reviewId
        ),
      };
    });
  } catch (error) {
    console.error("Failed to delete review", error);
    alert("Failed to delete review");
  }
};


  return (
    <div className={styles.page}>
      {/* ================= PRODUCT INFO ================= */}
      <div className={styles.productCard}>
        <img src={mainImage} alt={product.name} />

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
              className={
                product.isStock ? styles.inStock : styles.outStock
              }
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
              <strong>
                {product.isFeatured ? " Yes" : " No"}
              </strong>
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
        {product.reviews?.length === 0 && (
          <p>No reviews yet</p>
        )}

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

    {/* OPTIONAL ADMIN ACTIONS */}
    {/* ADMIN ACTIONS */}
<div className={styles.reviewActions}>
  <button
  className={styles.iconBtn}
  title="Edit Review"
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
  title="Delete Review"
  onClick={() => handleDeleteReview(r.id)}
>
  <FiTrash2 />
</button>

</div>

  </div>
))}
      </div>
      {editingReview && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3>Edit Review</h3>

      {/* Rating */}
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

      {/* Comment */}
      <label>Comment</label>
      <textarea
        value={editComment}
        onChange={(e) => setEditComment(e.target.value)}
        rows={4}
      />

      {/* Actions */}
      <div className={styles.modalActions}>
        <button
          onClick={() => setEditingReview(null)}
          className={styles.cancelBtn}
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateReview}
          disabled={saving}
          className={styles.saveBtn}
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
