import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styles from "./DeliveryPartners.module.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { useToast } from "@/components/toast/ToastContext";
/* ---------------- HELPERS ---------------- */
function filterByDate(orders, startDate, endDate) {
    return orders.filter((o) => {
        const d = new Date(o.createdAt);
        if (startDate && d < new Date(startDate))
            return false;
        if (endDate && d > new Date(endDate + "T23:59:59"))
            return false;
        return true;
    });
}
/* Reusable table rows */
function OrderRows({ orders }) {
    return (_jsx(_Fragment, { children: orders.map((order) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: order.orderNumber }) }), _jsxs("td", { children: [_jsx("div", { children: order.CustomerProfile.name }), _jsx("div", { style: { fontSize: 12, color: "#6b7280" }, children: order.CustomerProfile.user.email })] }), _jsx("td", { children: new Date(order.createdAt).toLocaleDateString() }), _jsxs("td", { children: [order.items.length, " item", order.items.length !== 1 ? "s" : ""] }), _jsxs("td", { children: ["QAR ", parseFloat(order.totalAmount).toFixed(2)] }), _jsx("td", { children: _jsx("span", { className: styles.paymentStatus, children: order.paymentStatus }) }), _jsx("td", { children: _jsx("span", { className: styles.orderStatus, children: order.status }) })] }, order.id))) }));
}
const ORDER_THEAD = (_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order Number" }), _jsx("th", { children: "Customer" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Payment" }), _jsx("th", { children: "Status" })] }) }));
/* ---------------- COMPONENT ---------------- */
export default function DeliveryPartnerDetail() {
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    /* Per-tab date filters */
    const [ordersStart, setOrdersStart] = useState("");
    const [ordersEnd, setOrdersEnd] = useState("");
    const [completedStart, setCompletedStart] = useState("");
    const [completedEnd, setCompletedEnd] = useState("");
    /* Edit mode */
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    /* Delete confirmation */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    /* ---------------- FETCH ---------------- */
    const fetchPartnerDetails = async () => {
        if (!id)
            return;
        setLoading(true);
        try {
            const res = await api.get(`/delivery-partners/${id}`);
            const partnerData = res.data.data;
            setPartner(partnerData);
            setEditForm({
                name: partnerData.AdminProfile?.name || "",
                email: partnerData.email,
                password: "",
            });
        }
        catch (error) {
            console.error("Failed to fetch partner details", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchAnalytics = async () => {
        if (!id)
            return;
        try {
            const res = await api.get("/delivery-partners/analytics/stats", {
                params: { partnerId: id },
            });
            setAnalytics(res.data.data);
        }
        catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    };
    const fetchOrders = async () => {
        if (!id)
            return;
        try {
            const res = await api.get("/delivery-partners/analytics/orders", {
                params: { partnerId: id },
            });
            setOrders(res.data.data.orders || []);
        }
        catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };
    useEffect(() => {
        fetchPartnerDetails();
        fetchAnalytics();
        fetchOrders();
    }, [id]);
    /* ---------------- HANDLERS ---------------- */
    const handleUpdate = async () => {
        if (!id)
            return;
        try {
            const payload = { name: editForm.name, email: editForm.email };
            if (editForm.password)
                payload.password = editForm.password;
            await api.patch(`/delivery-partners/${id}`, payload);
            showToast("Delivery partner updated successfully", "success");
            setIsEditing(false);
            fetchPartnerDetails();
        }
        catch (error) {
            console.error("Failed to update partner", error);
            showToast("Failed to update delivery partner", "error");
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        try {
            await api.delete(`/delivery-partners/${id}`);
            showToast("Delivery partner deleted successfully", "success");
            navigate("/deliveryPartner");
        }
        catch (error) {
            console.error("Failed to delete partner", error);
            showToast("Failed to delete delivery partner", "error");
        }
    };
    /* ---------------- DATE FILTER BAR ---------------- */
    function DateFilterBar({ start, end, onStartChange, onEndChange, onClear, }) {
        return (_jsxs("div", { className: styles.dateFilterBar, children: [_jsxs("div", { className: styles.dateFilterGroup, children: [_jsx("label", { children: "From" }), _jsx("input", { type: "date", value: start, max: end || undefined, onChange: (e) => onStartChange(e.target.value) })] }), _jsxs("div", { className: styles.dateFilterGroup, children: [_jsx("label", { children: "To" }), _jsx("input", { type: "date", value: end, min: start || undefined, onChange: (e) => onEndChange(e.target.value) })] }), (start || end) && (_jsx("button", { className: styles.clearDateBtn, onClick: onClear, children: "Clear" }))] }));
    }
    /* ---------------- RENDER TABS ---------------- */
    const renderTabContent = () => {
        switch (activeTab) {
            /* ── PROFILE ── */
            case "profile":
                return (_jsxs("div", { className: styles.profileSection, children: [_jsx("h3", { children: "Personal Information" }), _jsxs("div", { className: styles.profileGrid, children: [_jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Full Name" }), _jsx("div", { children: partner?.AdminProfile?.name || "—" })] }), _jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Email Address" }), _jsx("div", { children: partner?.email || "—" })] }), _jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Phone Number" }), _jsx("div", { children: partner?.AdminProfile?.phone || "—" })] }), _jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Role" }), _jsx("div", { children: partner?.role || "—" })] }), _jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Status" }), _jsx("div", { children: _jsx("span", { className: partner?.isActive ? styles.active : styles.inactive, children: partner?.isActive ? "Active" : "Inactive" }) })] }), _jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Joined Date" }), _jsx("div", { children: partner?.createdAt
                                                ? new Date(partner.createdAt).toLocaleDateString()
                                                : "—" })] })] }), partner?.AdminProfile?.notes && (_jsxs("div", { className: styles.profileField, children: [_jsx("label", { children: "Notes" }), _jsx("div", { children: partner.AdminProfile.notes })] }))] }));
            /* ── TOTAL ORDERS ── */
            case "orders": {
                const filtered = filterByDate(orders, ordersStart, ordersEnd);
                return (_jsxs("div", { className: styles.ordersSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h3", { children: "All Orders" }), _jsx(DateFilterBar, { start: ordersStart, end: ordersEnd, onStartChange: setOrdersStart, onEndChange: setOrdersEnd, onClear: () => { setOrdersStart(""); setOrdersEnd(""); } })] }), filtered.length === 0 ? (_jsx("p", { className: styles.emptyState, children: "No orders found" })) : (_jsx("div", { className: styles.ordersTable, children: _jsxs("table", { children: [ORDER_THEAD, _jsx("tbody", { children: _jsx(OrderRows, { orders: filtered }) })] }) }))] }));
            }
            /* ── COMPLETED & RETURNED ── */
            case "completed": {
                const allFiltered = filterByDate(orders, completedStart, completedEnd);
                const completedOrders = allFiltered.filter((o) => o.status === "delivered" || o.status === "completed");
                const returnedOrders = allFiltered.filter((o) => o.status === "returned" || o.status === "cancelled");
                return (_jsxs("div", { className: styles.ordersSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h3", { children: "Completed Orders" }), _jsx(DateFilterBar, { start: completedStart, end: completedEnd, onStartChange: setCompletedStart, onEndChange: setCompletedEnd, onClear: () => { setCompletedStart(""); setCompletedEnd(""); } })] }), completedOrders.length === 0 ? (_jsx("p", { className: styles.emptyState, children: "No completed orders" })) : (_jsx("div", { className: styles.ordersTable, children: _jsxs("table", { children: [ORDER_THEAD, _jsx("tbody", { children: _jsx(OrderRows, { orders: completedOrders }) })] }) })), _jsx("h3", { style: { marginTop: 32 }, children: "Returned Orders" }), returnedOrders.length === 0 ? (_jsx("p", { className: styles.emptyState, children: "No returned orders" })) : (_jsx("div", { className: styles.ordersTable, children: _jsxs("table", { children: [ORDER_THEAD, _jsx("tbody", { children: _jsx(OrderRows, { orders: returnedOrders }) })] }) }))] }));
            }
            /* ── MANAGE ── */
            case "manage":
                return (_jsxs("div", { className: styles.manageSection, children: [_jsx("h3", { children: "Manage Delivery Partner" }), !isEditing ? (_jsxs("div", { className: styles.manageActions, children: [_jsx("button", { className: styles.editBtn, onClick: () => setIsEditing(true), children: "Edit Details" }), _jsxs("button", { className: styles.deleteBtn, onClick: () => setShowDeleteModal(true), children: [_jsx(FiTrash2, {}), " Delete Partner"] })] })) : (_jsxs("div", { className: styles.editForm, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Name" }), _jsx("input", { type: "text", value: editForm.name, onChange: (e) => setEditForm({ ...editForm, name: e.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: editForm.email, onChange: (e) => setEditForm({ ...editForm, email: e.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "New Password (leave blank to keep current)" }), _jsx("input", { type: "password", value: editForm.password, onChange: (e) => setEditForm({ ...editForm, password: e.target.value }), placeholder: "Enter new password" })] }), _jsxs("div", { className: styles.formActions, children: [_jsx("button", { className: styles.saveBtn, onClick: handleUpdate, children: "Save Changes" }), _jsx("button", { className: styles.cancelBtn, onClick: () => {
                                                setIsEditing(false);
                                                setEditForm({
                                                    name: partner?.AdminProfile?.name || "",
                                                    email: partner?.email || "",
                                                    password: "",
                                                });
                                            }, children: "Cancel" })] })] }))] }));
            default:
                return null;
        }
    };
    /* ---------------- UI ---------------- */
    if (loading) {
        return (_jsx("div", { className: styles.page, children: _jsx("div", { style: { textAlign: "center", padding: 40 }, children: "Loading partner details..." }) }));
    }
    if (!partner) {
        return (_jsx("div", { className: styles.page, children: _jsx("div", { style: { textAlign: "center", padding: 40 }, children: "Partner not found" }) }));
    }
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.detailHeader, children: [_jsxs("button", { className: styles.backBtn, onClick: () => navigate(-1), children: [_jsx(FiArrowLeft, {}), " Back"] }), _jsxs("div", { className: styles.headerInfo, children: [_jsx("h1", { children: partner.AdminProfile?.name || partner.email }), _jsx("p", { children: partner.email })] })] }), analytics && (_jsxs("div", { className: styles.stats, children: [_jsx(StatCard, { title: "Total Orders", value: analytics.summary.totalOrders.toString() }), _jsx(StatCard, { title: "Completed Orders", value: analytics.summary.completedOrders.toString() }), _jsx(StatCard, { title: "Total Revenue", value: `QAR ${analytics.summary.totalRevenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}` }), _jsx(StatCard, { title: "Average Order Value", value: `QAR ${analytics.summary.averageOrderValue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}` })] })), _jsx("div", { className: styles.tabs, children: ["profile", "orders", "completed", "manage"].map((tab) => (_jsxs("button", { className: activeTab === tab ? styles.activeTab : "", onClick: () => setActiveTab(tab), children: [tab === "profile" && "Full Profile", tab === "orders" && "Total Orders", tab === "completed" && "Completed & Returned", tab === "manage" && "Manage"] }, tab))) }), _jsx("div", { className: styles.tabContent, children: renderTabContent() }), showDeleteModal && (_jsx("div", { className: styles.modalOverlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: "Delete Delivery Partner" }), _jsx("p", { children: "Are you sure you want to delete this delivery partner? This action cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx("button", { className: styles.confirmDeleteBtn, onClick: handleDelete, children: "Delete" }), _jsx("button", { className: styles.cancelBtn, onClick: () => setShowDeleteModal(false), children: "Cancel" })] })] }) }))] }));
}
/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value }) {
    return (_jsxs("div", { className: styles.statCard, children: [_jsx("span", { children: title }), _jsx("h3", { children: value })] }));
}
