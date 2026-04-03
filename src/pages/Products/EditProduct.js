import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditProduct.module.css";
import { useToast } from "../../components/toast/ToastContext";
import axios from "axios";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
export default function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    /* ================= PRODUCT ================= */
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [stockCount, setStockCount] = useState(0);
    const [actualPrice, setActualPrice] = useState("");
    const [discountedPrice, setDiscountedPrice] = useState("");
    const [isStock, setIsStock] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [subCategoryId, setSubCategoryId] = useState("");
    const [variationTitle, setVariationTitle] = useState("");
    /* ================= IMAGES ================= */
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    /* ================= VARIATIONS ================= */
    const [variationsEnabled, setVariationsEnabled] = useState(false);
    const [variations, setVariations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteImageId, setDeleteImageId] = useState(null);
    const [showVariationDeleteConfirm, setShowVariationDeleteConfirm] = useState(false);
    const [deleteVariationIndex, setDeleteVariationIndex] = useState(null);
    /* ================= LOAD PRODUCT ================= */
    const getErrorMessage = (err) => {
        if (axios.isAxiosError(err)) {
            if (err.message?.includes("413") ||
                err.code === "ERR_BAD_REQUEST") {
                return "Uploaded images are too large. Please upload smaller images.";
            }
            if (err.response?.status === 413) {
                return "Uploaded images are too large. Please upload smaller images.";
            }
            return err.response?.data?.message || "Something went wrong";
        }
        return "Something went wrong";
    };
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                const p = res.data.data;
                setName(p.name);
                setDescription(p.description || "");
                setStockCount(p.stockCount);
                setActualPrice(p.actualPrice);
                setDiscountedPrice(p.discountedPrice);
                setIsStock(p.isStock);
                setIsFeatured(p.isFeatured);
                setSubCategoryId(p.subCategoryId);
                setVariationTitle(p.variationTitle || "");
                if (p.images?.length) {
                    setImages(p.images);
                }
                if (p.variations?.length) {
                    setVariationsEnabled(true);
                    setVariations(p.variations.map((v) => ({
                        id: v.id,
                        variationName: v.variationName,
                        discountedPrice: v.discountedPrice,
                        actualPrice: v.actualPrice,
                        stockCount: String(v.stockCount),
                        isAvailable: v.isAvailable,
                    })));
                }
            }
            catch {
                showToast("Failed to load product", "error");
            }
            finally {
                setLoading(false);
            }
        };
        if (id)
            fetchProduct();
    }, [id, showToast]);
    /* ================= IMAGE HANDLERS ================= */
    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || !id)
            return;
        try {
            const formData = new FormData();
            // Append multiple images
            files.forEach((file) => {
                formData.append("image", file);
            });
            await api.post(`/products/${id}/gallery/images/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            showToast("Images uploaded successfully", "success");
            e.target.value = "";
        }
        catch (err) {
            showToast(getErrorMessage(err), "error");
        }
    };
    const deleteImage = async (imageId, index) => {
        // New image
        if (!imageId && index !== undefined) {
            setNewImages((prev) => prev.filter((_, i) => i !== index));
            return;
        }
        if (!imageId || !id) {
            showToast("Invalid product or image", "error");
            return;
        }
        try {
            await api.delete(`/products/${id}/gallery/images/${imageId}`);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
            showToast("Image deleted successfully", "success");
        }
        catch (err) {
            console.error(err);
            showToast(err?.response?.data?.message || "Failed to delete image", "error");
        }
    };
    const handleConfirmDeleteImage = async () => {
        if (!deleteImageId || !id)
            return;
        try {
            await api.delete(`/products/${id}/gallery/images/${deleteImageId}`);
            setImages((prev) => prev.filter((img) => img.id !== deleteImageId));
            showToast("Image deleted successfully", "success");
        }
        catch (err) {
            showToast(err?.response?.data?.message || "Failed to delete image", "error");
        }
        finally {
            setShowDeleteConfirm(false);
            setDeleteImageId(null);
        }
    };
    /* ================= VARIATIONS ================= */
    const addVariation = () => {
        setVariations((v) => [
            ...v,
            {
                variationName: "",
                discountedPrice: "",
                actualPrice: "",
                stockCount: "",
                isAvailable: true,
            },
        ]);
    };
    const updateVariation = (index, key, value) => {
        const copy = [...variations];
        copy[index] = { ...copy[index], [key]: value };
        setVariations(copy);
    };
    const handleConfirmDeleteVariation = async () => {
        if (deleteVariationIndex === null)
            return;
        const variation = variations[deleteVariationIndex];
        try {
            if (variation.id) {
                await api.delete(`/product-variations/${variation.id}`);
            }
            setVariations((prev) => prev.filter((_, i) => i !== deleteVariationIndex));
            showToast("Variation deleted successfully", "success");
        }
        catch {
            showToast("Failed to delete variation", "error");
        }
        finally {
            setShowVariationDeleteConfirm(false);
            setDeleteVariationIndex(null);
        }
    };
    const validateForm = () => {
        if (variationsEnabled && variations.length === 0) {
            showToast("Add at least one variation or disable variations", "error");
            return false;
        }
        if (!name.trim()) {
            showToast("Product name is required", "error");
            return false;
        }
        if (stockCount < 0) {
            showToast("Stock quantity cannot be negative", "error");
            return false;
        }
        if (!actualPrice || Number(actualPrice) <= 0) {
            showToast("Actual price must be greater than 0", "error");
            return false;
        }
        if (Number(discountedPrice) < 0) {
            showToast("Discounted price cannot be negative", "error");
            return false;
        }
        if (Number(discountedPrice) > Number(actualPrice)) {
            showToast("Discounted price cannot be greater than actual price", "error");
            return false;
        }
        if (variationsEnabled) {
            const totalVariationStock = variations.reduce((sum, v) => sum + Number(v.stockCount || 0), 0);
            if (totalVariationStock > stockCount) {
                showToast(`Total variation stock (${totalVariationStock}) cannot exceed product stock (${stockCount})`, "error");
                return false;
            }
        }
        if (variationsEnabled) {
            for (let i = 0; i < variations.length; i++) {
                const v = variations[i];
                if (!v.variationName.trim()) {
                    showToast(`Variation ${i + 1}: Name is required`, "error");
                    return false;
                }
                if (!v.actualPrice || Number(v.actualPrice) <= 0) {
                    showToast(`Variation ${i + 1}: Actual price must be greater than 0`, "error");
                    return false;
                }
                if (Number(v.discountedPrice) < 0) {
                    showToast(`Variation ${i + 1}: Discounted price cannot be negative`, "error");
                    return false;
                }
                if (Number(v.discountedPrice) > Number(v.actualPrice)) {
                    showToast(`Variation ${i + 1}: Discounted price cannot exceed actual price`, "error");
                    return false;
                }
                if (Number(v.stockCount) < 0) {
                    showToast(`Variation ${i + 1}: Stock cannot be negative`, "error");
                    return false;
                }
            }
        }
        return true;
    };
    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            const payload = {
                name,
                description,
                stockCount,
                actualPrice: Number(actualPrice),
                discountedPrice: Number(discountedPrice),
                subCategoryId,
                isFeatured,
                variationTitle,
            };
            if (variationsEnabled) {
                payload.variations = variations.map((v) => ({
                    id: v.id,
                    variationName: v.variationName,
                    discountedPrice: Number(v.discountedPrice),
                    actualPrice: Number(v.actualPrice),
                    stockCount: Number(v.stockCount),
                }));
            }
            await api.patch(`/products/${id}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            showToast("Product updated successfully", "success");
            navigate(-1);
        }
        catch (err) {
            showToast(getErrorMessage(err), "error");
        }
    };
    if (loading)
        return _jsx("p", { children: "Loading..." });
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("button", { className: styles.backBtn, onClick: () => navigate(-1), children: [_jsx(FiArrowLeft, {}), " Back"] }), _jsxs("form", { className: styles.card, onSubmit: handleSubmit, children: [_jsxs("label", { className: styles.uploadBox, children: [_jsx(FiUpload, { size: 22 }), _jsx("span", { children: "Upload product images" }), _jsx("input", { hidden: true, type: "file", accept: "image/*", multiple: true, onChange: handleImageChange })] }), _jsxs("div", { className: styles.imageSection, children: [_jsx("h4", { className: styles.imageTitle, children: "Product Images" }), _jsxs("div", { className: styles.imageGrid, children: [images.map((img) => (_jsxs("div", { className: `${styles.imageCard} ${img.isMain ? styles.mainImage : ""}`, children: [_jsx("img", { src: img.url, alt: "product" }), img.isMain && (_jsx("span", { className: styles.mainBadge, children: "Main" })), _jsx("button", { type: "button", className: styles.deleteIcon, onClick: () => {
                                                    setDeleteImageId(img.id);
                                                    setShowDeleteConfirm(true);
                                                }, title: "Delete image", children: "\u00D7" })] }, img.id))), newImages.map((file, i) => (_jsxs("div", { className: styles.imageCard, children: [_jsx("img", { src: URL.createObjectURL(file), alt: "preview" }), _jsx("button", { type: "button", className: styles.deleteIcon, onClick: () => deleteImage(undefined, i), title: "Remove image", children: "\u00D7" })] }, `${file.name}-${i}`)))] })] }), _jsxs("div", { className: styles.grid, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Name" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Stock Quantity" }), _jsx("input", { type: "number", value: stockCount, onChange: (e) => setStockCount(Number(e.target.value)) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Regular Price" }), _jsx("input", { value: actualPrice, onChange: (e) => setActualPrice(e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discounted Price" }), _jsx("input", { value: discountedPrice, onChange: (e) => setDiscountedPrice(e.target.value) })] })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Description" }), _jsx("textarea", { rows: 3, value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsx("div", { className: styles.switchRow, children: _jsxs("div", { className: styles.toggleItem, children: [_jsx("span", { className: styles.toggleLabel, children: "Featured" }), _jsxs("label", { className: styles.toggleSwitch, children: [_jsx("input", { type: "checkbox", checked: isFeatured, onChange: () => setIsFeatured(!isFeatured) }), _jsx("span", { className: styles.slider })] })] }) }), _jsxs("div", { className: styles.variationHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: "Product Variations" }), _jsx("p", { className: styles.variationHint, children: "Add sizes, colors or models with different prices" }), _jsxs("div", { className: styles.variationTitleField, children: [_jsx("label", { children: "Variation Title" }), _jsx("input", { type: "text", value: variationTitle, onChange: (e) => setVariationTitle(e.target.value), placeholder: "Size, Color, Model" })] })] }), _jsxs("label", { className: styles.toggleSwitch, children: [_jsx("input", { type: "checkbox", checked: variationsEnabled, onChange: () => setVariationsEnabled((v) => !v) }), _jsx("span", { className: styles.slider })] })] }), variationsEnabled && (_jsxs("div", { className: styles.variationList, children: [variations.map((v, i) => (_jsxs("div", { className: styles.variationCard, children: [_jsxs("div", { className: styles.variationGrid, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Variation Name" }), _jsx("input", { value: v.variationName, onChange: (e) => updateVariation(i, "variationName", e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Actual Price" }), _jsx("input", { value: v.actualPrice, onChange: (e) => updateVariation(i, "actualPrice", e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discounted Price" }), _jsx("input", { value: v.discountedPrice, onChange: (e) => updateVariation(i, "discountedPrice", e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Stock" }), _jsx("input", { type: "text", inputMode: "numeric", pattern: "[0-9]*", value: v.stockCount, onChange: (e) => {
                                                            const value = e.target.value;
                                                            if (/^\d*$/.test(value)) {
                                                                updateVariation(i, "stockCount", value);
                                                            }
                                                        } })] })] }), _jsxs("div", { className: styles.variationActions, children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: v.isAvailable, onChange: (e) => updateVariation(i, "isAvailable", e.target.checked) }), "Available"] }), _jsx("button", { type: "button", onClick: () => {
                                                    setDeleteVariationIndex(i);
                                                    setShowVariationDeleteConfirm(true);
                                                }, className: styles.delete, children: _jsx(FiTrash2, {}) })] })] }, i))), _jsxs("button", { type: "button", onClick: addVariation, className: styles.addBtn, children: [_jsx(FiPlus, {}), " Add Variation"] })] })), _jsxs("div", { className: styles.actions, children: [_jsx("button", { type: "button", onClick: () => navigate(-1), children: "Cancel" }), _jsx("button", { type: "submit", className: styles.gradientBtn, children: "Update Product" })] })] }), _jsx(ConfirmModal, { open: showDeleteConfirm, title: "Delete Image", message: "Are you sure you want to delete this image? This action cannot be undone.", confirmText: "Delete", onCancel: () => {
                    setShowDeleteConfirm(false);
                    setDeleteImageId(null);
                }, onConfirm: handleConfirmDeleteImage }), _jsx(ConfirmModal, { open: showVariationDeleteConfirm, title: "Delete Variation", message: "Are you sure you want to delete this variation?", confirmText: "Delete", onCancel: () => {
                    setShowVariationDeleteConfirm(false);
                    setDeleteVariationIndex(null);
                }, onConfirm: handleConfirmDeleteVariation })] }));
}
