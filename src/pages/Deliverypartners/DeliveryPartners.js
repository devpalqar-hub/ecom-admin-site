import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./DeliveryPartners.module.css";
import { FiSearch, FiUser, FiMail } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
import api from "../../services/api";
/* ---------------- COMPONENT ---------------- */
export default function DeliveryPartners() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    /* Analytics states */
    const [totalOrders, setTotalOrders] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [averageOrderValue, setAverageOrderValue] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [newPartner, setNewPartner] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    /* Pagination */
    const [page, setPage] = useState(1);
    const limit = 10;
    /* ---------------- FETCH ---------------- */
    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get("/delivery-partners");
            const allPartners = res.data.data;
            setPartners(allPartners);
        }
        catch (error) {
            console.error("Failed to fetch delivery partners", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchAnalytics = async () => {
        try {
            const endDate = new Date().toISOString().split("T")[0];
            const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1))
                .toISOString()
                .split("T")[0];
            let totalOrdersSum = 0;
            let completedOrdersSum = 0;
            let totalRevenueSum = 0;
            let partnerCount = 0;
            for (const partner of partners) {
                try {
                    const res = await api.get("/delivery-partners/analytics/stats", {
                        params: {
                            partnerId: partner.id,
                        },
                    });
                    const summary = res.data.data.summary;
                    totalOrdersSum += summary.totalOrders;
                    completedOrdersSum += summary.completedOrders;
                    totalRevenueSum += summary.totalRevenue;
                    partnerCount++;
                }
                catch (error) {
                    console.error(`Failed to fetch analytics for partner ${partner.id}`);
                }
            }
            setTotalOrders(totalOrdersSum);
            setCompletedOrders(completedOrdersSum);
            setTotalRevenue(totalRevenueSum);
            setAverageOrderValue(partnerCount > 0 ? totalRevenueSum / totalOrdersSum || 0 : 0);
        }
        catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    };
    useEffect(() => {
        fetchPartners();
    }, []);
    useEffect(() => {
        if (partners.length > 0) {
            fetchAnalytics();
        }
    }, [partners]);
    /* ---------------- FILTERING ---------------- */
    const filteredPartners = useMemo(() => {
        let filtered = partners;
        if (search) {
            filtered = filtered.filter((p) => p.AdminProfile?.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase()));
        }
        if (statusFilter) {
            const isActive = statusFilter === "active";
            filtered = filtered.filter((p) => p.isActive === isActive);
        }
        return filtered;
    }, [partners, search, statusFilter]);
    /* ---------------- PAGINATION ---------------- */
    const paginatedPartners = useMemo(() => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return filteredPartners.slice(start, end);
    }, [filteredPartners, page]);
    const totalPages = Math.ceil(filteredPartners.length / limit);
    /* ---------------- STATS ---------------- */
    const stats = useMemo(() => {
        const activeCount = partners.filter((p) => p.isActive).length;
        const inactiveCount = partners.filter((p) => !p.isActive).length;
        return {
            total: partners.length,
            active: activeCount,
            inactive: inactiveCount,
            totalOrders: totalOrders,
            completedOrders: completedOrders,
            revenue: totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        };
    }, [partners, totalOrders, completedOrders, totalRevenue]);
    /* ---------------- HANDLERS ---------------- */
    const handlePartnerClick = (id) => {
        navigate(`/deliveryPartner/${id}`);
    };
    const handleCreatePartner = async () => {
        if (!newPartner.name || !newPartner.email || !newPartner.password) {
            showToast("All fields required", "error");
            return;
        }
        try {
            await api.post("/delivery-partners", newPartner);
            setShowCreate(false);
            setNewPartner({ name: "", email: "", phone: "", password: "" });
            fetchPartners();
        }
        catch (err) {
            console.error(err);
            showToast(err?.response?.data?.message || "Failed to create partner", "error");
        }
    };
    /* ---------------- UI ---------------- */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { children: "Delivery Partners" }), _jsx("p", { children: "Manage and monitor your delivery fleet performance" })] }), _jsx("button", { className: styles.createBtn, onClick: () => setShowCreate(true), children: "Create New Partner" })] }), _jsxs("div", { className: styles.stats, children: [_jsx(StatCard, { title: "Total Partners", value: stats.total.toString() }), _jsx(StatCard, { title: "Active Partners", value: stats.active.toString() }), _jsx(StatCard, { title: "Total Orders", value: stats.totalOrders.toString() }), _jsx(StatCard, { title: "Completed Orders", value: stats.completedOrders.toString() }), _jsx(StatCard, { title: "Total Revenue", value: `QAR ${stats.revenue}` })] }), _jsxs("div", { className: styles.filters, children: [_jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search delivery partners...", value: search, onChange: (e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                } })] }), _jsx("div", { className: styles.filterBox, children: _jsxs("select", { value: statusFilter, onChange: (e) => {
                                setPage(1);
                                setStatusFilter(e.target.value);
                            }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }) })] }), _jsxs("div", { className: styles.tableWrapper, children: [_jsx("div", { className: styles.tableScroll, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Partner" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Joined" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: "center", padding: 20 }, children: "Loading delivery partners..." }) })) : paginatedPartners.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: "center", padding: 20 }, children: "No delivery partners found" }) })) : (paginatedPartners.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: p.AdminProfile?.name || "—" }) }), _jsx("td", { children: p.email }), _jsx("td", { children: p.AdminProfile?.phone || "—" }), _jsx("td", { children: new Date(p.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("span", { className: p.isActive ? styles.active : styles.inactive, children: p.isActive ? "active" : "inactive" }) }), _jsx("td", { className: styles.actions, children: _jsx("button", { className: styles.viewBtn, onClick: () => handlePartnerClick(p.id), children: "View Profile" }) })] }, p.id)))) })] }) }), _jsx("div", { className: styles.mobileCards, children: paginatedPartners.map((p) => (_jsxs("div", { className: styles.partnerCard, children: [_jsxs("div", { className: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("strong", { children: p.AdminProfile?.name || "—" }), _jsx("div", { style: { fontSize: 13, color: "#6b7280", marginTop: 4 }, children: p.email })] }), _jsx("div", { className: styles.actions, children: _jsx("button", { className: styles.viewBtn, onClick: () => handlePartnerClick(p.id), children: "View" }) })] }), _jsxs("div", { className: styles.cardDetails, children: [_jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Phone:" }), _jsx("span", { className: styles.cardValue, children: p.AdminProfile?.phone || "—" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Joined:" }), _jsx("span", { className: styles.cardValue, children: new Date(p.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Status:" }), _jsx("span", { className: p.isActive ? styles.active : styles.inactive, children: p.isActive ? "active" : "inactive" })] })] })] }, p.id))) }), totalPages > 1 && (_jsxs("div", { className: styles.pagination, children: [_jsx("button", { className: styles.pageBtn, disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }), _jsxs("span", { className: styles.pageInfo, children: ["Page ", page, " of ", totalPages] }), _jsx("button", { className: styles.pageBtn, disabled: page === totalPages, onClick: () => setPage((p) => p + 1), children: "Next" })] }))] }), showCreate && (_jsx("div", { className: styles.modalOverlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: "Create Delivery Partner" }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Name" }), _jsx("input", { value: newPartner.name, onChange: (e) => setNewPartner({ ...newPartner, name: e.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: newPartner.email, onChange: (e) => setNewPartner({ ...newPartner, email: e.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Phone" }), _jsx("input", { type: "tel", value: newPartner.phone, onChange: (e) => setNewPartner({ ...newPartner, phone: e.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: newPartner.password, onChange: (e) => setNewPartner({ ...newPartner, password: e.target.value }) })] }), _jsxs("div", { className: styles.modalActions, children: [_jsx("button", { className: styles.cancelBtn, onClick: () => setShowCreate(false), children: "Cancel" }), _jsx("button", { className: styles.saveBtn, onClick: handleCreatePartner, children: "Create" })] })] }) }))] }));
}
/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value }) {
    return (_jsxs("div", { className: styles.statCard, children: [_jsx("span", { children: title }), _jsx("h3", { children: value })] }));
}
