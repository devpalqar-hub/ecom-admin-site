import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./ReturnedItems.module.css";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
/* ---------------- COMPONENT ---------------- */
export default function ReturnedItems() {
    const navigate = useNavigate();
    /* UI STATES */
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    /* FILTER STATES */
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    /* PAGINATION */
    const [page, setPage] = useState(1);
    const limit = 10;
    /* ---------------- DATE RANGE HELPER ---------------- */
    const getDateRange = () => {
        if (!dateFilter)
            return {};
        const endDate = new Date();
        const startDate = new Date();
        if (dateFilter === "7")
            startDate.setDate(endDate.getDate() - 7);
        if (dateFilter === "30")
            startDate.setDate(endDate.getDate() - 30);
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };
    };
    /* ---------------- FETCH RETURNS ---------------- */
    const fetchReturns = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const res = await api.get("/returns/admin/all", {
                params: {
                    page,
                    limit,
                    status: status || undefined,
                    deliveryPartnerId: deliveryPartnerId || undefined,
                    startDate,
                    endDate,
                },
            });
            setReturns(res.data.data.data ?? res.data.data ?? []);
        }
        catch (error) {
            console.error("Failed to fetch returns", error);
        }
        finally {
            setLoading(false);
        }
    };
    /* ---------------- FETCH DELIVERY PARTNERS ---------------- */
    const fetchDeliveryPartners = async () => {
        try {
            const res = await api.get("/delivery-partners");
            setDeliveryPartners(res.data.data ?? []);
        }
        catch (error) {
            console.error("Failed to fetch delivery partners", error);
        }
    };
    /* ---------------- EFFECT ---------------- */
    useEffect(() => {
        fetchDeliveryPartners();
    }, []);
    useEffect(() => {
        fetchReturns();
    }, [page, status, deliveryPartnerId, dateFilter]);
    /* ---------------- STATUS BADGE COLOR ---------------- */
    const getStatusClass = (s) => {
        switch (s) {
            case "pending": return styles.pending;
            case "approved": return styles.approved;
            case "rejected": return styles.rejected;
            case "picked_up": return styles.pickedUp;
            case "returned": return styles.returned;
            case "refunded": return styles.refunded;
            default: return "";
        }
    };
    const formatStatus = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    /* ---------------- FILTERED BY SEARCH (CLIENT SIDE) ---------------- */
    const filtered = search
        ? returns.filter((r) => r.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            r.customerProfile?.name?.toLowerCase().includes(search.toLowerCase()))
        : returns;
    /* ---------------- UI ---------------- */
    return (_jsxs("div", { className: styles.page, children: [_jsx("div", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { children: "Returned Items" }), _jsx("p", { children: "Manage and track customer return requests" })] }) }), _jsxs("div", { className: styles.filters, children: [_jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search by order number or customer...", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsxs("select", { value: status, onChange: (e) => {
                            setPage(1);
                            setStatus(e.target.value);
                        }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "picked_up", children: "Picked Up" }), _jsx("option", { value: "returned", children: "Returned" }), _jsx("option", { value: "refunded", children: "Refunded" })] }), _jsxs("select", { value: deliveryPartnerId, onChange: (e) => {
                            setPage(1);
                            setDeliveryPartnerId(e.target.value);
                        }, children: [_jsx("option", { value: "", children: "All Delivery Partners" }), deliveryPartners.map((dp) => (_jsx("option", { value: dp.id, children: dp.AdminProfile?.name ?? dp.email }, dp.id)))] }), _jsxs("select", { value: dateFilter, onChange: (e) => {
                            setPage(1);
                            setDateFilter(e.target.value);
                        }, children: [_jsx("option", { value: "", children: "All Time" }), _jsx("option", { value: "7", children: "Last 7 days" }), _jsx("option", { value: "30", children: "Last 30 days" })] })] }), _jsx("div", { className: styles.tableWrapper, children: loading ? (_jsx("p", { style: { padding: "20px" }, children: "Loading returns..." })) : (_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order #" }), _jsx("th", { children: "Customer" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Return Type" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Refund Amount" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: filtered.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: "center", padding: "32px", color: "#6b7280" }, children: "No return requests found" }) })) : (filtered.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.order?.orderNumber ?? "—" }), _jsx("td", { children: r.customerProfile?.name && (_jsx("strong", { children: r.customerProfile.name })) }), _jsxs("td", { children: [new Date(r.createdAt).toLocaleDateString(), _jsx("div", { className: styles.time, children: new Date(r.createdAt).toLocaleTimeString() })] }), _jsx("td", { children: _jsx("span", { className: styles.returnType, children: r.returnType === "partial" ? "Partial" : "Full" }) }), _jsx("td", { children: r.returnItems?.length ?? 0 }), _jsxs("td", { children: ["QAR ", r.refundAmount] }), _jsx("td", { children: _jsx("span", { className: `${styles.status} ${getStatusClass(r.status)}`, children: formatStatus(r.status) }) }), _jsx("td", { children: _jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/returned-items/${r.id}`), children: "View Details" }) })] }, r.id)))) })] })) }), _jsx("div", { className: styles.mobileList, children: filtered.map((r) => (_jsxs("div", { className: styles.mobileCard, children: [_jsxs("div", { className: styles.cardHeader, children: [_jsx("strong", { children: r.order?.orderNumber ?? "—" }), _jsx("span", { className: `${styles.status} ${getStatusClass(r.status)}`, children: formatStatus(r.status) })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Customer" }), _jsx("p", { children: r.customerProfile?.name ?? "-" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Date" }), _jsxs("p", { children: [new Date(r.createdAt).toLocaleDateString(), _jsx("br", {}), _jsx("small", { children: new Date(r.createdAt).toLocaleTimeString() })] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Return Type" }), _jsx("p", { children: r.returnType === "partial" ? "Partial" : "Full" })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Refund" }), _jsxs("strong", { children: ["QAR ", r.refundAmount] })] }), _jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/returned-items/${r.id}`), children: "View Details" })] }, r.id))) }), _jsxs("div", { className: styles.pagination, children: [_jsx("button", { className: styles.pageBtn, disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }), _jsxs("span", { className: styles.pageInfo, children: ["Page ", page] }), _jsx("button", { className: styles.pageBtn, onClick: () => setPage((p) => p + 1), disabled: filtered.length < limit, children: "Next" })] })] }));
}
