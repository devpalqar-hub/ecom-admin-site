import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditSubCategory.module.css";
import { useToast } from "../../components/toast/ToastContext";
export default function EditSubCategory() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    /* ================= FETCH DATA ================= */
    useEffect(() => {
        if (!id)
            return;
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
            }
            catch (error) {
                console.error("Failed to load subcategory", error);
                showToast("Failed to load subcategory", "error");
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    /* ================= IMAGE CHANGE ================= */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };
    /* ================= UPDATE ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id || !name.trim())
            return;
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
        }
        catch (error) {
            console.error("Update failed", error?.response?.data || error);
            showToast("Failed to update subcategory", "error");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return _jsx("p", { style: { padding: 20 }, children: "Loading subcategory..." });
    }
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsx("button", { className: styles.backBtn, onClick: () => navigate(-1), children: _jsx(FiArrowLeft, {}) }), _jsxs("div", { children: [_jsx("h1", { children: "Edit Subcategory" }), _jsx("p", { children: "Update subcategory details" })] })] }), _jsx("div", { className: styles.card, children: _jsxs("form", { className: styles.form, onSubmit: handleSubmit, children: [_jsxs("label", { className: styles.uploadBox, children: [_jsx(FiUpload, {}), _jsx("span", { children: "Upload subcategory image" }), _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), preview && (_jsx("div", { className: styles.preview, children: _jsx("img", { src: preview, alt: "Preview" }) })), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Subcategory Name *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), required: true })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Category *" }), _jsxs("select", { value: categoryId, onChange: (e) => setCategoryId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select category" }), categories.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id)))] })] }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { type: "button", className: styles.cancel, onClick: () => navigate(-1), disabled: saving, children: "Cancel" }), _jsx("button", { type: "submit", className: styles.save, disabled: saving, children: saving ? "Updating..." : "Update Subcategory" })] })] }) })] }));
}
