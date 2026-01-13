import styles from "./Orders.module.css";
import { FiDownload, FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";

/* ---------------- TYPES ---------------- */
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: any[];
  CustomerProfile?: {
    name: string | null;
  };
}
interface OrderAggregates {
  totalOrders: number;
  processedOrders: number;
  shippedOrders: number;
  completedOrders: number;
}


/* ---------------- COMPONENT ---------------- */
export default function Orders() {
  /* UI STATES */
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATES */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const limit = 10;

  const [aggregates, setAggregates] = useState<OrderAggregates | null>(null);

  /* ---------------- DATE RANGE HELPER ---------------- */
  const getDateRange = () => {
    if (!dateFilter) return {};

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
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
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
  } catch (error) {
    console.error("Failed to fetch order aggregates", error);
  }
};


  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
  fetchOrders();
  fetchOrderAggregates();
}, [page, search, status, dateFilter]);

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p>Manage and track customer orders</p>
        </div>

        <button className={styles.exportBtn}>
          <FiDownload /> Export Orders
        </button>
      </div>

      {/* STATS (STATIC UI KEPT) */}
      <div className={styles.stats}>
        <StatCard
            title="Total Orders"
            value={aggregates?.totalOrders?.toString() ?? "—"}
            variant="total"
            />

            <StatCard
            title="Processing"
            value={aggregates?.processedOrders?.toString() ?? "—"}
            variant="processing"
            />

            <StatCard
            title="Shipped"
            value={aggregates?.shippedOrders?.toString() ?? "—"}
            variant="shipped"
            />

            <StatCard
            title="Completed"
            value={aggregates?.completedOrders?.toString() ?? "—"}
            variant="completed"
            />
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => {
            setPage(1);
            setDateFilter(e.target.value);
          }}
        >
          <option value="">All Time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading orders...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>
                        {o.CustomerProfile?.name && (
                            <strong>{o.CustomerProfile.name}</strong>
                        )}
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleDateString()}
                    <div className={styles.time}>
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </div>
                  </td>

                  <td>{o.items.length}</td>

                  <td>₹{o.totalAmount}</td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[o.status]
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td>
                    <button className={styles.viewBtn}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* PAGINATION */}
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
            >
                Prev
            </button>

            <span className={styles.pageInfo}>
                Page {page}
            </span>

            <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p + 1)}
            >
                Next
            </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */
function StatCard({
  title,
  value,
  variant,
}: {
  title: string;
  value: string;
  variant: string;
}) {
  return (
    <div className={`${styles.statCard} ${styles[variant]}`}>
      <span>{title}</span>
      <h3>{value}</h3>
    </div>
  );
}
