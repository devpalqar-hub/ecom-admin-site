import styles from "./ReturnedItems.module.css";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */
interface ReturnedItem {
  id: string;
  orderId: string;
  status: string;
  returnType: string;
  reason: string;
  refundAmount: string;
  returnFee: string;
  refundMethod: string;
  createdAt: string;
  order: {
    orderNumber: string;
    totalAmount: string;
  };
  customerProfile: {
    name: string;
    phone: string;
    user: {
      email: string;
    };
  };
  deliveryPartner: {
    id: string;
    email: string;
    AdminProfile: {
      name: string;
      phone: string | null;
    };
  } | null;
  returnItems: any[];
}

interface DeliveryPartner {
  id: string;
  email: string;
  AdminProfile: {
    name: string;
    phone: string | null;
  };
}

/* ---------------- COMPONENT ---------------- */
export default function ReturnedItems() {
  const navigate = useNavigate();

  /* UI STATES */
  const [returns, setReturns] = useState<ReturnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);

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
    if (!dateFilter) return {};
    const endDate = new Date();
    const startDate = new Date();
    if (dateFilter === "7") startDate.setDate(endDate.getDate() - 7);
    if (dateFilter === "30") startDate.setDate(endDate.getDate() - 30);
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
    } catch (error) {
      console.error("Failed to fetch returns", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH DELIVERY PARTNERS ---------------- */
  const fetchDeliveryPartners = async () => {
    try {
      const res = await api.get("/delivery-partners");
      setDeliveryPartners(res.data.data ?? []);
    } catch (error) {
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
  const getStatusClass = (s: string) => {
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

  const formatStatus = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* ---------------- FILTERED BY SEARCH (CLIENT SIDE) ---------------- */
  const filtered = search
    ? returns.filter(
        (r) =>
          r.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          r.customerProfile?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : returns;

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Returned Items</h1>
          <p>Manage and track customer return requests</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="picked_up">Picked Up</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={deliveryPartnerId}
          onChange={(e) => {
            setPage(1);
            setDeliveryPartnerId(e.target.value);
          }}
        >
          <option value="">All Delivery Partners</option>
          {deliveryPartners.map((dp) => (
            <option key={dp.id} value={dp.id}>
              {dp.AdminProfile?.name ?? dp.email}
            </option>
          ))}
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
          <p style={{ padding: "20px" }}>Loading returns...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Return Type</th>
                <th>Items</th>
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No return requests found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.order?.orderNumber ?? "—"}</td>
                    <td>
                      {r.customerProfile?.name && (
                        <strong>{r.customerProfile.name}</strong>
                      )}
                    </td>
                    <td>
                      {new Date(r.createdAt).toLocaleDateString()}
                      <div className={styles.time}>
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span className={styles.returnType}>
                        {r.returnType === "partial" ? "Partial" : "Full"}
                      </span>
                    </td>
                    <td>{r.returnItems?.length ?? 0}</td>
                    <td>QAR {r.refundAmount}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(r.status)}`}>
                        {formatStatus(r.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(`/returned-items/${r.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className={styles.mobileList}>
        {filtered.map((r) => (
          <div key={r.id} className={styles.mobileCard}>
            <div className={styles.cardHeader}>
              <strong>{r.order?.orderNumber ?? "—"}</strong>
              <span className={`${styles.status} ${getStatusClass(r.status)}`}>
                {formatStatus(r.status)}
              </span>
            </div>

            <div className={styles.cardRow}>
              <span>Customer</span>
              <p>{r.customerProfile?.name ?? "-"}</p>
            </div>

            <div className={styles.cardRow}>
              <span>Date</span>
              <p>
                {new Date(r.createdAt).toLocaleDateString()}
                <br />
                <small>{new Date(r.createdAt).toLocaleTimeString()}</small>
              </p>
            </div>

            <div className={styles.cardRow}>
              <span>Return Type</span>
              <p>{r.returnType === "partial" ? "Partial" : "Full"}</p>
            </div>

            <div className={styles.cardRow}>
              <span>Refund</span>
              <strong>QAR {r.refundAmount}</strong>
            </div>

            <button
              className={styles.viewBtn}
              onClick={() => navigate(`/returned-items/${r.id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => p + 1)}
          disabled={filtered.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}