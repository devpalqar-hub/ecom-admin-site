import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./SubCategories.module.css";
import { FiPlus, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight, } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
/* ================= COMPONENT ================= */
export default function SubCategories() {
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { showToast } = useToast();
    /* ================= FETCH ================= */
    const fetchSubCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/subcategories", {
                params: { search: search || undefined },
            });
            setSubCategories(res.data.data.data ?? []);
        }
        catch (err) {
            showToast("Failed to load subcategories", "error");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSubCategories();
    }, [search]);
    /* ================= TOGGLE STATUS ================= */
    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        // optimistic update
        setSubCategories((prev) => prev.map((s) => s.id === id ? { ...s, isActive: newStatus } : s));
        try {
            await api.patch(`/subcategories/${id}`, {
                isActive: newStatus,
            });
            showToast("Subcategory status updated", "success");
        }
        catch (error) {
            console.error("Status update failed", error);
            // rollback
            setSubCategories((prev) => prev.map((s) => s.id === id ? { ...s, isActive: currentStatus } : s));
            showToast("Failed to update status", "error");
        }
    };
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { children: "Subcategories" }), _jsx("p", { children: "Manage product subcategories" })] }), _jsxs("button", { className: styles.addBtn, onClick: () => navigate("/subcategories/add"), children: [_jsx(FiPlus, {}), " Add Subcategory"] })] }), _jsx("div", { className: styles.filters, children: _jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search subcategories...", value: search, onChange: (e) => setSearch(e.target.value) })] }) }), _jsx("div", { className: styles.tableWrapper, children: loading ? (_jsx("p", { className: styles.loading, children: "Loading subcategories..." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Image" }), _jsx("th", { children: "Name" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [subCategories.map((sub) => (_jsxs("tr", { children: [_jsx("td", { className: styles.imageCell, children: sub.image ? (_jsx("img", { src: sub.image, alt: sub.name, className: styles.subImage, onError: (e) => (e.currentTarget.src = "/placeholder.png") })) : (_jsx("span", { className: styles.noImage, children: "\u2014" })) }), _jsx("td", { children: sub.name }), _jsx("td", { children: sub.description || "-" }), _jsx("td", { children: sub.category?.name || "-" }), _jsxs("td", { className: styles.actions, children: [_jsx("button", { className: styles.editBtn, onClick: () => navigate(`/subcategories/edit/${sub.id}`), title: "Edit", children: _jsx(FiEdit2, {}) }), _jsx("button", { className: `${styles.toggleBtn} ${sub.isActive ? styles.active : styles.inactive}`, onClick: () => handleToggleStatus(sub.id, sub.isActive), title: sub.isActive ? "Deactivate" : "Activate", children: sub.isActive ? (_jsx(FiToggleRight, { size: 22 })) : (_jsx(FiToggleLeft, { size: 22 })) })] })] }, sub.id))), subCategories.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: styles.empty, children: "No subcategories found" }) }))] })] })) }), _jsx("div", { className: styles.mobileList, children: subCategories.map((sub) => (_jsxs("div", { className: styles.mobileCard, children: [_jsxs("div", { className: styles.cardHeader, children: [_jsxs("div", { className: styles.cardLeft, children: [sub.image ? (_jsx("img", { src: sub.image, alt: sub.name, className: styles.mobileImage })) : (_jsx("div", { className: styles.mobileImagePlaceholder })), _jsx("h4", { children: sub.name })] }), _jsxs("div", { className: styles.cardActions, children: [_jsx("button", { className: styles.editBtn, onClick: () => navigate(`/subcategories/edit/${sub.id}`), children: _jsx(FiEdit2, {}) }), _jsx("button", { className: `${styles.toggleBtn} ${sub.isActive ? styles.active : styles.inactive}`, onClick: () => handleToggleStatus(sub.id, sub.isActive), children: sub.isActive ? (_jsx(FiToggleRight, { size: 22 })) : (_jsx(FiToggleLeft, { size: 22 })) })] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Description" }), _jsx("p", { children: sub.description || "-" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Category" }), _jsx("strong", { children: sub.category?.name || "-" })] })] }, sub.id))) })] }));
}
