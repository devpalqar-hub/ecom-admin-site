import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./Customers.module.css";
import { FiSearch } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
/* ---------------- COMPONENT ---------------- */
export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    /* filters */
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [activeCount, setActiveCount] = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    /* pagination */
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    /* ---------------- FETCH ---------------- */
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users/admin/customers", {
                params: {
                    page,
                    limit,
                    search: search || undefined,
                    status: status || undefined,
                },
            });
            const payload = res.data.data;
            setCustomers(payload.data);
            setTotalPages(payload.totalPages);
        }
        catch (error) {
            console.error("Failed to fetch customers", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchRevenueFromDashboard = async () => {
        try {
            const res = await api.get("/dashboard/admin");
            setTotalRevenue(res.data.data.totalRevenue);
        }
        catch (error) {
            console.error("Failed to fetch revenue", error);
        }
    };
    useEffect(() => {
        fetchCustomers();
        fetchCustomerCounts();
        fetchRevenueFromDashboard();
    }, [page, search, status]);
    /* ---------------- STATS ---------------- */
    const stats = useMemo(() => {
        return {
            total: totalCustomers,
            active: activeCount,
            inactive: inactiveCount,
            revenue: totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        };
    }, [customers, totalCustomers, activeCount, inactiveCount, totalRevenue]);
    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === "active" ? "inactive" : "active";
        setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, status: nextStatus } : c));
        try {
            await api.patch(`/users/${id}/status`, {
                isActive: nextStatus === "active",
            });
        }
        catch (error) {
            console.error("Status update failed", error);
            setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, status: currentStatus } : c));
        }
    };
    const fetchCustomerCount = async (isActive) => {
        const res = await api.get("/users/admin/customers/count", {
            params: { isActive },
        });
        const roles = res.data.data.data;
        const customerCount = roles.find((r) => r.role === "CUSTOMER")?.count ?? 0;
        return customerCount;
    };
    const fetchCustomerCounts = async () => {
        try {
            const res = await api.get("/users/admin/customers/count");
            const roles = res.data.data.data;
            const customerTotal = roles.find((r) => r.role === "CUSTOMER")?.count ?? 0;
            setTotalCustomers(customerTotal);
            // active inactive counts
            const [active, inactive] = await Promise.all([
                fetchCustomerCount(true),
                fetchCustomerCount(false),
            ]);
            setActiveCount(active);
            setInactiveCount(inactive);
        }
        catch (error) {
            console.error("Failed to fetch customer counts", error);
        }
    };
    /* ---------------- UI ---------------- */
    return (_jsxs("div", { className: styles.page, children: [_jsx("div", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { children: "Customers" }), _jsx("p", { children: "Manage and monitor your customers" })] }) }), _jsxs("div", { className: styles.stats, children: [_jsx(StatCard, { title: "Total Customers", value: stats.total.toString() }), _jsx(StatCard, { title: "Active Customers", value: stats.active.toString() }), _jsx(StatCard, { title: "Inactive Customers", value: stats.inactive.toString() }), _jsx(StatCard, { title: "Total Revenue", value: `QAR ${stats.revenue}` })] }), _jsxs("div", { className: styles.filters, children: [_jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search customers...", value: search, onChange: (e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                } })] }), _jsx("div", { className: styles.filterBox, children: _jsxs("select", { value: status, onChange: (e) => {
                                setPage(1);
                                setStatus(e.target.value);
                            }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }) })] }), _jsxs("div", { className: styles.tableWrapper, children: [_jsx("div", { className: styles.tableScroll, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Customer" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Orders" }), _jsx("th", { children: "Spent" }), _jsx("th", { children: "Joined" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: "center", padding: 20 }, children: "Loading customers..." }) })) : customers.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: "center", padding: 20 }, children: "No customers found" }) })) : (customers.map((c) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: c.customerName || "—" }) }), _jsx("td", { children: c.email }), _jsx("td", { children: c.phoneNumber || "—" }), _jsx("td", { children: c.numberOfOrders }), _jsxs("td", { children: ["QAR ", c.totalAmountSpent.toLocaleString("en-IN")] }), _jsx("td", { children: new Date(c.joinedDate).toLocaleDateString() }), _jsx("td", { children: _jsx("span", { className: c.status === "active"
                                                        ? styles.active
                                                        : styles.inactive, children: c.status }) }), _jsx("td", { className: styles.actions, children: _jsx("button", { className: c.status === "active"
                                                        ? styles.activeBtn
                                                        : styles.inactiveBtn, onClick: () => handleToggleStatus(c.id, c.status), children: c.status === "active" ? "Deactivate" : "Activate" }) })] }, c.id)))) })] }) }), _jsx("div", { className: styles.mobileCards, children: customers.map((c) => (_jsxs("div", { className: styles.customerCard, children: [_jsxs("div", { className: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("strong", { children: c.customerName || "—" }), _jsx("div", { style: { fontSize: 13, color: "#6b7280", marginTop: 4 }, children: c.email })] }), _jsx("div", { className: styles.actions, children: _jsx("button", { className: c.status === "active"
                                                    ? styles.activeBtn
                                                    : styles.inactiveBtn, onClick: () => handleToggleStatus(c.id, c.status), children: c.status === "active" ? "Deactivate" : "Activate" }) })] }), _jsxs("div", { className: styles.cardDetails, children: [_jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Phone:" }), _jsx("span", { className: styles.cardValue, children: c.phoneNumber || "—" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Orders:" }), _jsx("span", { className: styles.cardValue, children: c.numberOfOrders })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Spent:" }), _jsxs("span", { className: styles.cardValue, children: ["QAR ", c.totalAmountSpent.toLocaleString("en-IN")] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Joined:" }), _jsx("span", { className: styles.cardValue, children: new Date(c.joinedDate).toLocaleDateString() })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { className: styles.cardLabel, children: "Status:" }), _jsx("span", { className: c.status === "active"
                                                        ? styles.active
                                                        : styles.inactive, children: c.status })] })] })] }, c.id))) }), totalPages > 1 && (_jsxs("div", { className: styles.pagination, children: [_jsx("button", { className: styles.pageBtn, disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }), _jsxs("span", { className: styles.pageInfo, children: ["Page ", page, " of ", totalPages] }), _jsx("button", { className: styles.pageBtn, disabled: page === totalPages, onClick: () => setPage((p) => p + 1), children: "Next" })] }))] })] }));
}
/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value }) {
    return (_jsxs("div", { className: styles.statCard, children: [_jsx("span", { children: title }), _jsx("h3", { children: value })] }));
}
