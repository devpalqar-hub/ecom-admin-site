import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { FiShoppingCart, FiUsers, FiBox, FiDollarSign, } from "react-icons/fi";
import {} from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, } from "recharts";
import SalesPulseCard from "./salesPulseCard/SalesPulseCard";
import { useNavigate } from "react-router-dom";
/* ---------------- COMPONENT ---------------- */
export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerCount, setCustomerCount] = useState(0);
    const PIE_COLORS = ["#0F172A", "#c32c2c", "#f59e0b", "#5aee15", "#8b5cf6"];
    const fetchDashboard = async () => {
        try {
            const [statsRes, ordersRes, productsRes, customerCountRes] = await Promise.all([
                api.get("/dashboard/admin"),
                api.get("/dashboard/recent-orders"),
                api.get("/dashboard/top-products"),
                api.get("/users/admin/customers/count"),
            ]);
            const users = customerCountRes.data.data.data;
            const customers = users.find((u) => u.role === "CUSTOMER");
            setCustomerCount(customers?.count ?? 0);
            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data.data);
            setTopProducts(productsRes.data.data.data);
        }
        catch (err) {
            console.error("Dashboard fetch failed", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDashboard();
    }, []);
    if (loading) {
        return _jsx("p", { style: { padding: 24 }, children: "Loading dashboard..." });
    }
    const salesTrendData = stats?.categoryWiseAnalytics?.map((c) => ({
        name: c.categoryName,
        revenue: c.totalRevenue,
    })) ?? [];
    return (_jsxs("div", { className: styles.page, children: [_jsx("div", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { children: "Dashboard" }), _jsx("p", { children: "Overview of store performance" })] }) }), _jsxs("div", { className: styles.stats, children: [_jsx(StatCard, { title: "Total Revenue", value: stats?.totalRevenue !== undefined
                            ? `QAR ${stats.totalRevenue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`
                            : "QAR 0.00", icon: _jsx(FiDollarSign, {}), variant: "revenue" }), _jsx(StatCard, { title: "Customers", value: customerCount.toString(), icon: _jsx(FiUsers, {}), variant: "customers" }), _jsx(StatCard, { title: "Orders", value: stats ? stats.totalOrders.toString() : "-", icon: _jsx(FiShoppingCart, {}), variant: "orders" }), _jsx(StatCard, { title: "Products", value: stats ? stats.totalProducts.toString() : "-", icon: _jsx(FiBox, {}), variant: "products" })] }), _jsx(SalesPulseCard, {}), _jsxs("div", { className: styles.charts, children: [_jsxs("div", { className: styles.chartCard, children: [_jsx("h3", { children: "Sales Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(LineChart, { data: salesTrendData, children: [_jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { tickFormatter: (value) => value !== undefined
                                                ? `₹${Number(value).toLocaleString("en-IN")}`
                                                : "" }), _jsx(Tooltip, { formatter: (value) => value !== undefined
                                                ? `₹${Number(value).toLocaleString("en-IN")}`
                                                : "" }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#0F172A", strokeWidth: 3, dot: { r: 4 }, activeDot: { r: 6 } })] }) })] }), _jsxs("div", { className: styles.chartCard, children: [_jsx("h3", { children: "Sales by Category" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: stats?.categoryWiseAnalytics, dataKey: "totalRevenue", nameKey: "categoryName", innerRadius: 60, outerRadius: 90, paddingAngle: 4, children: stats?.categoryWiseAnalytics.map((_, index) => (_jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, index))) }), _jsx(Tooltip, {})] }) })] })] }), _jsxs("div", { className: styles.grid, children: [_jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Recent Orders" }), _jsx("div", { className: styles.list, children: recentOrders.map((o) => (_jsxs("div", { className: styles.orderItem, onClick: () => navigate(`/orders/${o.id}`), style: { cursor: "pointer" }, children: [_jsxs("div", { children: [_jsx("strong", { children: o.orderNumber }), _jsx("p", { children: o.customerName || o.customerEmail })] }), _jsxs("div", { className: styles.orderRight, children: [_jsxs("span", { className: styles.amount, children: ["QAR ", o.totalAmount] }), _jsx("span", { className: `${styles.status} ${styles[o.status]}`, children: o.status })] })] }, o.id))) })] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Top Products" }), _jsx("div", { className: styles.list, children: topProducts.map((p, i) => (_jsxs("div", { className: styles.productItem, children: [_jsxs("div", { className: styles.productLeft, children: [_jsx("span", { className: styles.rank, children: i + 1 }), _jsx("img", { src: p.image, alt: p.productName }), _jsxs("div", { children: [_jsx("strong", { children: p.productName }), _jsxs("p", { children: [p.totalSold, " sold"] })] })] }), _jsxs("span", { className: styles.amount, children: ["QAR ", p.totalRevenue.toLocaleString("en-IN")] })] }, p.id))) })] })] })] }));
}
/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value, icon, variant, }) {
    return (_jsxs("div", { className: `${styles.statCard} ${styles[variant]}`, children: [_jsxs("div", { children: [_jsx("span", { children: title }), _jsx("h3", { children: value })] }), _jsx("div", { className: styles.icon, children: icon })] }));
}
