import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./Orders.module.css";
import { FiDownload, FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
/* ---------------- COMPONENT ---------------- */
export default function Orders() {
    const navigate = useNavigate();
    /* UI STATES */
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    /* FILTER STATES */
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    /* PAGINATION */
    const [page, setPage] = useState(1);
    const limit = 10;
    const [aggregates, setAggregates] = useState(null);
    /* ---------------- DATE RANGE HELPER ---------------- */
    const getDateRange = () => {
        if (!dateFilter)
            return {};
        const endDate = new Date();
        const startDate = new Date();
        if (dateFilter === "7") {
            startDate.setDate(endDate.getDate() - 7);
        }
        if (dateFilter === "30") {
            startDate.setDate(endDate.getDate() - 30);
        }
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };
    };
    /* ---------------- FETCH ORDERS ---------------- */
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const res = await api.get("/orders/admin/get-all", {
                params: {
                    page,
                    limit,
                    search: search || undefined,
                    status: status || undefined,
                    startDate,
                    endDate,
                },
            });
            setOrders(res.data.data.data);
        }
        catch (error) {
            console.error("Failed to fetch orders", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchOrderAggregates = async () => {
        try {
            const { startDate, endDate } = getDateRange();
            const res = await api.get("/orders/admin/aggregates", {
                params: {
                    search: search || undefined,
                    status: status || undefined,
                    startDate,
                    endDate,
                },
            });
            setAggregates(res.data.data);
        }
        catch (error) {
            console.error("Failed to fetch order aggregates", error);
        }
    };
    /* ---------------- EFFECT ---------------- */
    useEffect(() => {
        fetchOrders();
        fetchOrderAggregates();
    }, [page, search, status, dateFilter]);
    const handleExportOrders = () => {
        // const token = localStorage.getItem("token"); 
        const link = document.createElement("a");
        link.href = "https://api.ecom.palqar.cloud/v1/orders/export/data";
        link.setAttribute("download", "orders.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    /* ---------------- UI ---------------- */
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { children: "Orders" }), _jsx("p", { children: "Manage and track customer orders" })] }), _jsxs("button", { className: styles.exportBtn, onClick: handleExportOrders, children: [_jsx(FiDownload, {}), " Export Orders"] })] }), _jsxs("div", { className: styles.stats, children: [_jsx(StatCard, { title: "Total Orders", value: aggregates?.totalOrders?.toString() ?? "—", variant: "total" }), _jsx(StatCard, { title: "Processing", value: aggregates?.processedOrders?.toString() ?? "—", variant: "processing" }), _jsx(StatCard, { title: "Shipped", value: aggregates?.shippedOrders?.toString() ?? "—", variant: "shipped" }), _jsx(StatCard, { title: "Completed", value: aggregates?.completedOrders?.toString() ?? "—", variant: "completed" })] }), _jsxs("div", { className: styles.filters, children: [_jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search orders...", value: search, onChange: (e) => {
                                    // setPage(1);
                                    setSearch(e.target.value);
                                } })] }), _jsxs("select", { value: status, onChange: (e) => {
                            setPage(1);
                            setStatus(e.target.value);
                        }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "confirmed", children: "Confirmed" }), _jsx("option", { value: "processing", children: "Processing" }), _jsx("option", { value: "shipped", children: "Shipped" }), _jsx("option", { value: "delivered", children: "Delivered" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "refunded", children: "Refunded" })] }), _jsxs("select", { value: dateFilter, onChange: (e) => {
                            setPage(1);
                            setDateFilter(e.target.value);
                        }, children: [_jsx("option", { value: "", children: "All Time" }), _jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" })] })] }), _jsx("div", { className: styles.tableWrapper, children: loading ? (_jsx("p", { style: { padding: "20px" }, children: "Loading orders..." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order ID" }), _jsx("th", { children: "Customer" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: orders.map((o) => (_jsxs("tr", { children: [_jsx("td", { children: o.orderNumber }), _jsx("td", { children: o.CustomerProfile?.name && (_jsx("strong", { children: o.CustomerProfile.name })) }), _jsxs("td", { children: [new Date(o.createdAt).toLocaleDateString(), _jsx("div", { className: styles.time, children: new Date(o.createdAt).toLocaleTimeString() })] }), _jsx("td", { children: o.items.length }), _jsxs("td", { children: ["QAR ", o.totalAmount] }), _jsx("td", { children: _jsx("span", { className: `${styles.status} ${styles[o.status]}`, children: o.status }) }), _jsx("td", { children: _jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/orders/${o.id}`), children: "View Details" }) })] }, o.id))) })] })) }), _jsx("div", { className: styles.mobileList, children: orders.map((o) => (_jsxs("div", { className: styles.mobileCard, children: [_jsxs("div", { className: styles.cardHeader, children: [_jsx("strong", { children: o.orderNumber }), _jsx("span", { className: `${styles.status} ${styles[o.status]}`, children: o.status })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Customer" }), _jsx("p", { children: o.CustomerProfile?.name ?? "-" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Date" }), _jsxs("p", { children: [new Date(o.createdAt).toLocaleDateString(), " ", _jsx("br", {}), _jsx("small", { children: new Date(o.createdAt).toLocaleTimeString() })] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Items" }), _jsx("strong", { children: o.items.length })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Total" }), _jsxs("strong", { children: ["\u20B9", o.totalAmount] })] }), _jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/orders/${o.id}`), children: "View Details" })] }, o.id))) }), _jsxs("div", { className: styles.pagination, children: [_jsx("button", { className: styles.pageBtn, disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }), _jsxs("span", { className: styles.pageInfo, children: ["Page ", page] }), _jsx("button", { className: styles.pageBtn, onClick: () => setPage((p) => p + 1), children: "Next" })] })] }));
}
/* ---------------- SMALL COMPONENT ---------------- */
function StatCard({ title, value, variant, }) {
    return (_jsxs("div", { className: `${styles.statCard} ${styles[variant]}`, children: [_jsx("span", { children: title }), _jsx("h3", { children: value })] }));
}
