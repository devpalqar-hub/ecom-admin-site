import styles from "./Coupons.module.css";
import { FiSearch, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import CouponFormModal from "./couponFormModal/CouponFormModal";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
/* ---------------- TYPES ---------------- */
interface Coupon {
  id: string;
  couponName: string;
  ValueType: "percentage" | "amount";
  Value: string;
  minimumSpent: string;
  usedByCount: number;
  usageLimitPerPerson: number;
  validFrom: string;
  ValidTill: string;
}

interface CouponsResponse {
  data: Coupon[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/* ---------------- COMPONENT ---------------- */
export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coupons", {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });

      const payload: CouponsResponse = res.data.data;
      setCoupons(payload.data);
      setTotalPages(payload.meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, search]);

  const isExpired = (date: string) => new Date(date) < new Date();

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditId(undefined);
    setShowModal(true);
  };
   const handleDeleteCoupon = async () => {
    if (!deleteCouponId) return;

    try {
      await api.delete(`/coupons/${deleteCouponId}`);

      setCoupons((prev) =>
        prev.filter((coupon) => coupon.id !== deleteCouponId)
      );

      setShowDeleteConfirm(false);
      setDeleteCouponId(null);

      showToast("Coupon deleted successfully", "success");
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to delete coupon",
        "error"
      );
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteCouponId(id);
    setShowDeleteConfirm(true);
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount coupons</p>
        </div>

        <button className={styles.addBtn} onClick={handleCreate}>
          <FiPlus /> Create Coupon
        </button>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className={styles.tableWrapper}>
        {/* DESKTOP TABLE */}
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Coupon</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Spend</th>
                <th>Used</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const expired = isExpired(c.ValidTill);

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.couponName}</strong>
                      </td>

                      <td>{c.ValueType}</td>

                      <td>
                        {c.ValueType === "percentage"
                          ? `${c.Value}%`
                          : `QAR ${c.Value}`}
                      </td>

                      <td>QAR {c.minimumSpent}</td>

                      <td>{c.usedByCount}</td>

                      <td>
                        {c.validFrom} → {c.ValidTill}
                      </td>

                      <td>
                        <span
                          className={expired ? styles.expired : styles.active}
                        >
                          {expired ? "Expired" : "Valid"}
                        </span>
                      </td>

                      <td className={styles.actions}>
                        <FiEdit
                          className={styles.actionIcon}
                          onClick={() => handleEdit(c.id)}
                        />
                        <FiTrash
                          className={styles.actionIcon}
                          color="red"
                          onClick={() => handleDeleteClick(c.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className={styles.mobileCards}>
          {coupons.length === 0 ? (
            <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
              No coupons found
            </p>
          ) : (
            coupons.map((c) => {
              const expired = isExpired(c.ValidTill);

              return (
                <div key={c.id} className={styles.couponCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{c.couponName}</h3>
                    <div className={styles.cardActions}>
                      <FiEdit
                        className={styles.actionIcon}
                        onClick={() => handleEdit(c.id)}
                      />
                      <FiTrash
                        className={styles.actionIcon}
                        style={{ color: "red" }}
                        onClick={() => handleDeleteClick(c.id)}
                      />
                    </div>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Type</span>
                    <span className={styles.cardValue}>{c.ValueType}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Value</span>
                    <span className={styles.cardValue}>
                      {c.ValueType === "percentage"
                        ? `${c.Value}%`
                        : `QAR ${c.Value}`}
                    </span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Min Spend</span>
                    <span className={styles.cardValue}>QAR {c.minimumSpent}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Used</span>
                    <span className={styles.cardValue}>{c.usedByCount}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Validity</span>
                    <span className={styles.cardValue}>
                      {c.validFrom} → {c.ValidTill}
                    </span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Status</span>
                    <span
                      className={expired ? styles.expired : styles.active}
                    >
                      {expired ? "Expired" : "Valid"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
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

      {/* MODAL */}
      <CouponFormModal
        open={showModal}
        couponId={editId}
        onClose={() => setShowModal(false)}
        onSuccess={fetchCoupons}
      />
      <ConfirmModal 
        open={showDeleteConfirm}
        title="Delete coupon?"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteCouponId(null);
        }}
        onConfirm={handleDeleteCoupon}
      />
    </div>
  );
}