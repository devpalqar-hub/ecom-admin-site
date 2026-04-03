import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import styles from "./Banner.module.css";
import api from "../../services/api";
import { useToast } from "../../components/toast/ToastContext";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
const Banners = () => {
    const { showToast } = useToast();
    const [banners, setBanners] = useState([]);
    /* ================= CREATE STATE ================= */
    const [createImage, setCreateImage] = useState(null);
    const [createTitle, setCreateTitle] = useState("");
    const [createLink, setCreateLink] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const createInFlightRef = useRef(false);
    /* ================= EDIT STATE ================= */
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editLink, setEditLink] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteBannerId, setDeleteBannerId] = useState(null);
    /* ================= FETCH ================= */
    const fetchBanners = async () => {
        try {
            const res = await api.get("/banners");
            setBanners(res.data.data);
        }
        catch {
            showToast("Failed to fetch banners", "error");
        }
    };
    useEffect(() => {
        fetchBanners();
    }, []);
    /* ================= CREATE ================= */
    const handleCreate = async () => {
        if (createInFlightRef.current)
            return;
        if (!createImage || !createTitle) {
            showToast("All fields are required", "error");
            return;
        }
        try {
            createInFlightRef.current = true;
            setIsCreating(true);
            const formData = new FormData();
            formData.append("image", createImage);
            formData.append("title", createTitle);
            formData.append("link", createLink);
            await api.post("/banners/admin", formData);
            showToast("Banner created successfully", "success");
            setCreateImage(null);
            setCreateTitle("");
            setCreateLink("");
            await fetchBanners();
        }
        catch {
            showToast("Failed to create banner", "error");
        }
        finally {
            createInFlightRef.current = false;
            setIsCreating(false);
        }
    };
    /* ================= OPEN EDIT ================= */
    const openEditModal = (banner) => {
        setEditingBanner(banner);
        setEditTitle(banner.title);
        setEditLink(banner.link);
        setEditImage(null);
        setIsEditOpen(true);
    };
    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        if (!editingBanner)
            return;
        try {
            const formData = new FormData();
            formData.append("title", editTitle);
            formData.append("link", editLink);
            if (editImage) {
                formData.append("image", editImage);
            }
            await api.patch(`/banners/admin/${editingBanner.id}`, formData);
            showToast("Banner updated successfully", "success");
            closeEditModal();
            fetchBanners();
        }
        catch {
            showToast("Failed to update banner", "error");
        }
    };
    /* ================= DELETE ================= */
    const handleDeleteBanner = async () => {
        if (!deleteBannerId)
            return;
        try {
            await api.delete(`/banners/admin/${deleteBannerId}`);
            showToast("Banner deleted", "success");
            fetchBanners();
        }
        catch {
            showToast("Failed to delete banner", "error");
        }
        finally {
            setShowDeleteConfirm(false);
            setDeleteBannerId(null);
        }
    };
    /* ================= CLOSE EDIT ================= */
    const closeEditModal = () => {
        setIsEditOpen(false);
        setEditingBanner(null);
        setEditTitle("");
        setEditLink("");
        setEditImage(null);
    };
    const handleDeleteClick = (id) => {
        setDeleteBannerId(id);
        setShowDeleteConfirm(true);
    };
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsx("h1", { children: "Banners" }), _jsx("p", { children: "Manage hero banners displayed on the client website" })] }), _jsx("div", { className: styles.tableWrapper, children: _jsxs("div", { className: styles.formCard, children: [_jsx("h3", { children: "Create Banner" }), _jsx("input", { type: "file", accept: "image/*", disabled: isCreating, onChange: (e) => setCreateImage(e.target.files?.[0] || null) }), _jsx("input", { type: "text", placeholder: "Banner title", value: createTitle, disabled: isCreating, onChange: (e) => setCreateTitle(e.target.value) }), _jsx("input", { type: "text", placeholder: "Redirect link (https://...)", value: createLink, disabled: isCreating, onChange: (e) => setCreateLink(e.target.value) }), _jsx("button", { onClick: handleCreate, disabled: isCreating, children: isCreating ? "Creating..." : "Create Banner" })] }) }), _jsxs("div", { className: styles.mobileCardList, children: [banners.map((b) => (_jsxs("div", { className: styles.bannerCard, children: [_jsx("img", { src: b.image, alt: b.title, className: styles.cardImage }), _jsxs("div", { className: styles.cardContent, children: [_jsx("h4", { className: styles.cardTitle, children: b.title }), _jsx("p", { className: styles.cardLink, children: b.link }), _jsxs("p", { className: styles.cardDate, children: ["Created: ", new Date(b.createdAt).toLocaleDateString()] }), _jsxs("div", { className: styles.cardActions, children: [_jsxs("button", { className: `${styles.cardButton} ${styles.edit}`, onClick: () => openEditModal(b), children: [_jsx(FiEdit, { size: 16 }), "Edit"] }), _jsxs("button", { className: `${styles.cardButton} ${styles.delete}`, onClick: () => handleDeleteClick(b.id), children: [_jsx(FiTrash, { size: 16 }), "Delete"] })] })] })] }, b.id))), banners.length === 0 && (_jsx("div", { className: styles.empty, children: "No banners created" }))] }), _jsx("div", { className: styles.tableWrapper, children: _jsx("div", { className: styles.tableScroll, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Preview" }), _jsx("th", { children: "Title" }), _jsx("th", { children: "Link" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [banners.map((b) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("img", { src: b.image, alt: b.title, className: styles.bannerImg }) }), _jsx("td", { children: b.title }), _jsx("td", { children: b.link }), _jsx("td", { children: new Date(b.createdAt).toLocaleDateString() }), _jsxs("td", { className: styles.actions, children: [_jsx(FiEdit, { onClick: () => openEditModal(b) }), _jsx(FiTrash, { onClick: () => handleDeleteClick(b.id) })] })] }, b.id))), banners.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: styles.empty, children: "No banners created" }) }))] })] }) }) }), isEditOpen && (_jsx("div", { className: styles.overlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: "Edit Banner" }), editingBanner && (_jsx("img", { src: editingBanner.image, className: styles.editPreview, alt: "Current banner" })), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setEditImage(e.target.files?.[0] || null) }), _jsx("input", { type: "text", placeholder: "Banner title", value: editTitle, onChange: (e) => setEditTitle(e.target.value) }), _jsx("input", { type: "text", placeholder: "Redirect link", value: editLink, onChange: (e) => setEditLink(e.target.value) }), _jsxs("div", { className: styles.modalActions, children: [_jsx("button", { onClick: handleUpdate, children: "Update" }), _jsx("button", { className: styles.cancelBtn, onClick: closeEditModal, children: "Cancel" })] })] }) })), _jsx(ConfirmModal, { open: showDeleteConfirm, title: "Delete Banner?", message: "Are you sure you want to delete this banner? This action cannot be undone.", confirmText: "Delete", onCancel: () => {
                    setShowDeleteConfirm(false);
                    setDeleteBannerId(null);
                }, onConfirm: handleDeleteBanner })] }));
};
export default Banners;
