import styles from "./DeliveryPartners.module.css";
import { FiSearch, FiUser, FiMail } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
import api from "../../services/api";

/* ---------------- TYPES ---------------- */
interface DeliveryPartner {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  AdminProfile: {
    name: string;
    phone: string | null;
    profilePicture: string | null;
    notes: string | null;
  } | null;
}

interface AnalyticsSummary {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

/* ---------------- COMPONENT ---------------- */
export default function DeliveryPartners() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
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
      const allPartners: DeliveryPartner[] = res.data.data;
      setPartners(allPartners);
    } catch (error) {
      console.error("Failed to fetch delivery partners", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(
        new Date().setMonth(new Date().getMonth() - 1)
      )
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
              startDate,
              endDate,
            },
          });

          const summary: AnalyticsSummary = res.data.data.summary;
          totalOrdersSum += summary.totalOrders;
          completedOrdersSum += summary.completedOrders;
          totalRevenueSum += summary.totalRevenue;
          partnerCount++;
        } catch (error) {
          console.error(`Failed to fetch analytics for partner ${partner.id}`);
        }
      }

      setTotalOrders(totalOrdersSum);
      setCompletedOrders(completedOrdersSum);
      setTotalRevenue(totalRevenueSum);
      setAverageOrderValue(
        partnerCount > 0 ? totalRevenueSum / totalOrdersSum || 0 : 0
      );
    } catch (error) {
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
      filtered = filtered.filter(
        (p) =>
          p.AdminProfile?.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      );
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
  const handlePartnerClick = (id: string) => {
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
  } catch (err: any) {
    console.error(err);
    showToast(err?.response?.data?.message || "Failed to create partner", "error");
  }
};
    
  /* ---------------- UI ---------------- */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Delivery Partners</h1>
          <p>Manage and monitor your delivery fleet performance</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
           Create New Partner
        </button>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <StatCard title="Total Partners" value={stats.total.toString()} />
        <StatCard title="Active Partners" value={stats.active.toString()} />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders.toString()}
        />
        <StatCard title="Total Revenue" value={`QAR ${stats.revenue}`} />
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search delivery partners..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <div className={styles.filterBox}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
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
                <th>Partner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    Loading delivery partners...
                  </td>
                </tr>
              ) : paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    No delivery partners found
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.AdminProfile?.name || "—"}</strong>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.AdminProfile?.phone || "—"}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={
                          p.isActive ? styles.active : styles.inactive
                        }
                      >
                        {p.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => handlePartnerClick(p.id)}
                      >
                        View Profile
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
          {paginatedPartners.map((p) => (
            <div key={p.id} className={styles.partnerCard}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>{p.AdminProfile?.name || "—"}</strong>
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}
                  >
                    {p.email}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handlePartnerClick(p.id)}
                  >
                    View
                  </button>
                </div>
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Phone:</span>
                  <span className={styles.cardValue}>
                    {p.AdminProfile?.phone || "—"}
                  </span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Joined:</span>
                  <span className={styles.cardValue}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Status:</span>
                  <span
                    className={p.isActive ? styles.active : styles.inactive}
                  >
                    {p.isActive ? "active" : "inactive"}
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
      {showCreate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create Delivery Partner</h3>

            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                value={newPartner.name}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, name: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={newPartner.email}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, email: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={newPartner.phone}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, phone: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={newPartner.password}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, password: e.target.value })
                }
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
                Cancel
              </button>

              <button className={styles.saveBtn} onClick={handleCreatePartner}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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