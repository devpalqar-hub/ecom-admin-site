import styles from "./Customers.module.css";
import { FiSearch } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

/* ---------------- TYPES ---------------- */
interface Customer {
  id: string;
  customerName: string | null;
  email: string;
  phoneNumber: string | null;
  numberOfOrders: number;
  totalAmountSpent: number;
  joinedDate: string;
  status: "active" | "inactive";
}

interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ---------------- COMPONENT ---------------- */
export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  /* filters */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

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

      const payload: CustomersResponse = res.data.data;

      setCustomers(payload.data);
      setTotalCustomers(payload.total);
      setTotalPages(payload.totalPages);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerCounts();
  }, [page, search, status]);

  /* ---------------- STATS ---------------- */
const stats = useMemo(() => {
  const revenue = customers.reduce(
    (sum, c) => sum + c.totalAmountSpent,
    0
  );

  return {
    total: totalCustomers,
    active: activeCount,
    inactive: inactiveCount,
    revenue: revenue.toFixed(2),
  };
}, [customers, totalCustomers, activeCount, inactiveCount]);

    const handleToggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
      const nextStatus = currentStatus === "active" ? "inactive" : "active";

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: nextStatus } : c
        )
      );

      try {
        await api.patch(`/users/${id}/status`, {
          isActive: nextStatus === "active",
        });
      } catch (error) {
        console.error("Status update failed", error);

        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: currentStatus } : c
          )
        );
      }
    };
    const fetchCustomerCount = async (
      status: "active" | "inactive"
    ) => {
      const res = await api.get("/users/admin/customers/count", {
        params: { status },
      });

      return res.data.data.total as number;
    };
    const fetchCustomerCounts = async () => {
      try {
        const [active, inactive] = await Promise.all([
          fetchCustomerCount("active"),
          fetchCustomerCount("inactive"),
        ]);

        setActiveCount(active);
        setInactiveCount(inactive);
      } catch (error) {
        console.error("Failed to fetch customer counts", error);
      }
    };

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p>Manage and monitor your customers</p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard title="Total Customers" value={stats.total.toString()} />
        <StatCard title="Active Customers" value={stats.active.toString()} />
        <StatCard title="Inactive Customers" value={stats.inactive.toString()} />
        <StatCard title="Total Revenue" value={`QAR ${stats.revenue}`} />
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      <div className={styles.filterBox}>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      </div>

      {/* TABLE WRAPPER */}
      <div className={styles.tableWrapper}>
        {/* DESKTOP TABLE VIEW */}
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.customerName || "—"}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phoneNumber || "—"}</td>
                    <td>{c.numberOfOrders}</td>
                    <td>QAR {c.totalAmountSpent.toLocaleString("en-IN")}</td>
                    <td>{new Date(c.joinedDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={
                          c.status === "active"
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={
                          c.status === "active"
                            ? styles.activeBtn
                            : styles.inactiveBtn
                        }
                        onClick={() => handleToggleStatus(c.id, c.status)}
                      >
                        {c.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className={styles.mobileCards}>
          {customers.map((c) => (
            <div key={c.id} className={styles.customerCard}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>{c.customerName || "—"}</strong>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    {c.email}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={
                      c.status === "active"
                        ? styles.activeBtn
                        : styles.inactiveBtn
                    }
                    onClick={() => handleToggleStatus(c.id, c.status)}
                  >
                    {c.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>

              </div>

              <div className={styles.cardDetails}>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Phone:</span>
                  <span className={styles.cardValue}>{c.phoneNumber || "—"}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Orders:</span>
                  <span className={styles.cardValue}>{c.numberOfOrders}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Spent:</span>
                  <span className={styles.cardValue}>
                    QAR {c.totalAmountSpent.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Joined:</span>
                  <span className={styles.cardValue}>
                    {new Date(c.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Status:</span>
                  <span
                    className={
                      c.status === "active"
                        ? styles.active
                        : styles.inactive
                    }
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>

            <button
              className={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <span>{title}</span>
      <h3>{value}</h3>
    </div>
  );
}