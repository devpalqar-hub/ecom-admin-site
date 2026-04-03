import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./AddSubCategory.module.css";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
import api from "../../services/api";
/* ================= COMPONENT ================= */
export default function AddSubCategory() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    /* ---------- slug helper ---------- */
    const generateSlug = (text) => text
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
            }
            catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);
    /* ---------- image change ---------- */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };
    /* ---------- submit ---------- */
    const handleSubmit = async () => {
        if (!name.trim() || !categoryId) {
            showToast("Subcategory name and category are required", "error");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("slug", generateSlug(name));
            formData.append("description", description.trim());
            formData.append("categoryId", categoryId);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            await api.post("/subcategories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            showToast("Subcategory created successfully", "success");
            navigate("/subcategories");
        }
        catch (err) {
            console.error("Create subcategory failed", err?.response?.data || err);
            showToast("Failed to create subcategory", "error");
        }
        finally {
            setLoading(false);
        }
    };
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsx("button", { className: styles.backBtn, onClick: () => navigate("/subcategories"), children: _jsx(FiArrowLeft, {}) }), _jsxs("div", { children: [_jsx("h1", { children: "Add SubCategory" }), _jsx("p", { children: "Create a new subcategory" })] })] }), _jsxs("div", { className: styles.card, children: [_jsxs("label", { className: styles.uploadBox, children: [_jsx(FiUpload, {}), _jsx("span", { children: "Upload subcategory image" }), _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), preview && (_jsx("div", { className: styles.preview, children: _jsx("img", { src: preview, alt: "Preview" }) })), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "SubCategory Name *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Shirts" })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Category *" }), _jsxs("select", { value: categoryId, onChange: (e) => setCategoryId(e.target.value), children: [_jsx("option", { value: "", children: "Select category" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional description" })] }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.cancel, onClick: () => navigate("/subcategories"), disabled: loading, children: "Cancel" }), _jsx("button", { className: styles.primary, onClick: handleSubmit, disabled: loading, children: loading ? "Creating..." : "Create SubCategory" })] })] })] }));
}
