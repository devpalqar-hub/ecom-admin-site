import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FiShoppingCart,
  FiUsers,
  FiBox,
  FiDollarSign,
} from "react-icons/fi";
import { type ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SalesPulseCard from "./salesPulseCard/SalesPulseCard";

/* ---------------- TYPES ---------------- */

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  categoryWiseAnalytics: {
    categoryId: string;
    categoryName: string;
    totalOrders: number;
    totalRevenue: number;
    productsSold: number;
  }[];
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface TopProduct {
  id: string;
  productName: string;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
  image: string;
}

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const PIE_COLORS = ["#0F172A", "#c32c2c", "#f59e0b", "#5aee15", "#8b5cf6"];
  /* ---------------- FETCH ---------------- */

  const fetchDashboard = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        api.get("/dashboard/admin"),
        api.get("/dashboard/recent-orders"),
        api.get("/dashboard/top-products"),
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data.data);
      setTopProducts(productsRes.data.data.data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <p style={{ padding: 24 }}>Loading dashboard...</p>;
  }
        const salesTrendData =
          stats?.categoryWiseAnalytics?.map((c) => ({
            name: c.categoryName,
            revenue: c.totalRevenue,
          })) ?? [];
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>Overview of store performance</p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue.toFixed(2)}`}
          icon={<FiDollarSign />}
          variant="revenue"
        />
        <StatCard
          title="Customers"
          value={stats ? stats.totalCustomers.toString() : "-"}
          icon={<FiUsers />}
          variant="customers"
        />
        <StatCard
          title="Orders"
          value={stats? stats.totalOrders.toString() : "-"}
          icon={<FiShoppingCart />}
          variant="orders"
        />
        <StatCard
          title="Products"
          value={stats ? stats.totalProducts.toString() : "-"}
          icon={<FiBox />}
          variant="products"
        />
      </div>
      <SalesPulseCard />
      {/* CHARTS */}
      <div className={styles.charts}>
        {/* SALES TREND */}

<div className={styles.chartCard}>
  <h3>Sales Trend</h3>

  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={salesTrendData}>
      <XAxis dataKey="name" />
      <YAxis
        tickFormatter={(value) =>
          value !== undefined
            ? `₹${Number(value).toLocaleString("en-IN")}`
            : ""
        }
      />
      <Tooltip
        formatter={(value) => 
          value!==undefined
          ? `₹${Number(value).toLocaleString("en-IN")}`
          : ""
        }
      />
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="#0F172A"
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>


        {/* SALES BY CATEGORY */}
        <div className={styles.chartCard}>
          <h3>Sales by Category</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats?.categoryWiseAnalytics}
                dataKey="totalRevenue"
                nameKey="categoryName"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {stats?.categoryWiseAnalytics.map((_, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {/* RECENT ORDERS */}
        <div className={styles.card}>
          <h3>Recent Orders</h3>

          <div className={styles.list}>
            {recentOrders.map((o) => (
              <div key={o.id} className={styles.orderItem}>
                <div>
                  <strong>{o.orderNumber}</strong>
                  <p>
                    {o.customerName || o.customerEmail}
                  </p>
                </div>

                <div className={styles.orderRight}>
                  <span className={styles.amount}>
                    ₹{o.totalAmount}
                  </span>
                  <span
                    className={`${styles.status} ${styles[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className={styles.card}>
          <h3>Top Products</h3>

          <div className={styles.list}>
            {topProducts.map((p, i) => (
              <div key={p.id} className={styles.productItem}>
                <div className={styles.productLeft}>
                  <span className={styles.rank}>{i + 1}</span>
                  <img src={p.image} alt={p.productName} />
                  <div>
                    <strong>{p.productName}</strong>
                    <p>{p.totalSold} sold</p>
                  </div>
                </div>

                <span className={styles.amount}>
                  ₹{p.totalRevenue.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  title,
  value,
  icon,
  variant,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  variant: string;
}) {
  return (
    <div className={`${styles.statCard} ${styles[variant]}`}>
      <div>
        <span>{title}</span>
        <h3>{value}</h3>
      </div>
      <div className={styles.icon}>{icon}</div>
    </div>
  );
}
