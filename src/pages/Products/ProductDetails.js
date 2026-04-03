import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./ProductDetails.module.css";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
/* ================= COMPONENT ================= */
export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const [saving, setSaving] = useState(false);
    /* ================= FETCH PRODUCT ================= */
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data.data);
            }
            catch (error) {
                console.error("Failed to load product details", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);
    /* ================= SET DEFAULT IMAGE ================= */
    useEffect(() => {
        if (product?.images?.length) {
            const main = product.images.find((i) => i.isMain)?.url ||
                product.images[0].url;
            setSelectedImage(main);
        }
    }, [product]);
    /* ================= REVIEW UPDATE ================= */
    const handleUpdateReview = async () => {
        if (!editingReview)
            return;
        try {
            setSaving(true);
            await api.patch(`/reviews/${editingReview.id}`, {
                rating: editRating,
                comment: editComment,
            });
            setProduct((prev) => prev
                ? {
                    ...prev,
                    reviews: prev.reviews?.map((r) => r.id === editingReview.id
                        ? { ...r, rating: editRating, comment: editComment }
                        : r),
                }
                : prev);
            setEditingReview(null);
        }
        catch (error) {
            console.error("Failed to update review", error);
            alert("Failed to update review");
        }
        finally {
            setSaving(false);
        }
    };
    /* ================= REVIEW DELETE ================= */
    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm("Are you sure you want to delete this review?");
        if (!confirmed)
            return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setProduct((prev) => prev
                ? {
                    ...prev,
                    reviews: prev.reviews?.filter((r) => r.id !== reviewId),
                }
                : prev);
        }
        catch (error) {
            console.error("Failed to delete review", error);
            alert("Failed to delete review");
        }
    };
    /* ================= STATES ================= */
    if (loading)
        return _jsx("p", { children: "Loading product..." });
    if (!product)
        return _jsx("p", { children: "Product not found" });
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("button", { className: styles.backBtn, onClick: () => navigate("/products"), children: [_jsx(FiArrowLeft, {}), " Back"] }), _jsxs("div", { className: styles.productLayout, children: [_jsxs("div", { className: styles.imageGallery, children: [_jsx("div", { className: styles.mainImage, children: _jsx("img", { src: selectedImage || "/placeholder.png", alt: product.name }) }), _jsx("div", { className: styles.thumbnailWrapper, children: _jsx("div", { className: styles.thumbnailRow, children: product.images.map((img) => (_jsx("img", { src: img.url, alt: "Thumbnail", className: img.url === selectedImage
                                            ? styles.activeThumb
                                            : styles.thumb, onClick: () => setSelectedImage(img.url) }, img.id))) }) })] }), _jsxs("div", { className: styles.productInfo, children: [_jsx("h2", { children: product.name }), _jsxs("div", { className: styles.meta, children: [_jsxs("span", { className: styles.badge, children: ["Category: ", product.subCategory?.category?.name || "-"] }), _jsxs("span", { className: styles.badge, children: ["Subcategory: ", product.subCategory?.name || "-"] }), _jsx("span", { className: product.isStock ? styles.inStock : styles.outStock, children: product.isStock ? "In Stock" : "Out of Stock" })] }), _jsxs("p", { className: styles.price, children: ["QAR ", product.discountedPrice, _jsxs("span", { children: ["QAR ", product.actualPrice] })] }), _jsx("p", { className: styles.desc, children: product.description }), product.variationTitle && product.variations?.length ? (_jsxs("div", { className: styles.variationBlock, children: [_jsx("h4", { children: product.variationTitle }), _jsx("div", { className: styles.variationOptions, children: product.variations.map((v) => (_jsx("span", { className: styles.variationTag, children: v.variationName }, v.id))) })] })) : null, _jsxs("p", { className: styles.stock, children: ["Stock Available: ", _jsx("strong", { children: product.stockCount })] }), _jsxs("div", { className: styles.extraInfo, children: [_jsxs("p", { children: ["Featured:", _jsx("strong", { children: product.isFeatured ? " Yes" : " No" })] }), _jsxs("p", { children: ["Created On:", _jsxs("strong", { children: [" ", new Date(product.createdAt).toLocaleDateString()] })] })] })] })] }), _jsx("h3", { className: styles.reviewTitle, children: "Customer Reviews" }), _jsxs("div", { className: styles.reviewGrid, children: [product.reviews?.length === 0 && _jsx("p", { children: "No reviews yet" }), product.reviews?.map((r) => (_jsxs("div", { className: styles.reviewCard, children: [_jsxs("div", { className: styles.reviewTop, children: [_jsx("div", { className: styles.avatar, children: r.user?.name?.charAt(0).toUpperCase() || "A" }), _jsxs("div", { className: styles.userBlock, children: [_jsx("strong", { children: r.user?.name || "Anonymous" }), _jsx("span", { className: styles.date, children: new Date(r.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: styles.stars, children: ["★".repeat(r.rating), "☆".repeat(5 - r.rating)] })] }), _jsx("p", { className: styles.comment, children: r.comment }), _jsxs("div", { className: styles.reviewActions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => {
                                            setEditingReview(r);
                                            setEditRating(r.rating);
                                            setEditComment(r.comment);
                                        }, children: _jsx(FiEdit2, {}) }), _jsx("button", { className: `${styles.iconBtn} ${styles.delete}`, onClick: () => handleDeleteReview(r.id), children: _jsx(FiTrash2, {}) })] })] }, r.id)))] }), editingReview && (_jsx("div", { className: styles.modalOverlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: "Edit Review" }), _jsx("label", { children: "Rating" }), _jsx("select", { value: editRating, onChange: (e) => setEditRating(Number(e.target.value)), children: [1, 2, 3, 4, 5].map((n) => (_jsxs("option", { value: n, children: [n, " Star", n > 1 && "s"] }, n))) }), _jsx("label", { children: "Comment" }), _jsx("textarea", { value: editComment, onChange: (e) => setEditComment(e.target.value), rows: 4 }), _jsxs("div", { className: styles.modalActions, children: [_jsx("button", { className: styles.cancelBtn, onClick: () => setEditingReview(null), children: "Cancel" }), _jsx("button", { className: styles.saveBtn, onClick: handleUpdateReview, disabled: saving, children: saving ? "Saving..." : "Update" })] })] }) }))] }));
}
