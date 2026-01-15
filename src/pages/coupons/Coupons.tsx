import styles from "./Coupons.module.css";
import { FiSearch, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import CouponFormModal from "./couponFormModal/CouponFormModal";

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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

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

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{ padding: 20 }}>Loading coupons...</p>
      </div>
    );
  }

  const isExpired = (date: string) =>
    new Date(date) < new Date();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
    } catch (err) {
        console.error("Failed to delete coupon", err);
    }
    };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount coupons</p>
        </div>

        <button className={styles.addBtn} onClick={() => {
            setEditId(undefined);
            setShowModal(true);
        }}>
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

      {/* TABLE */}
      <div className={styles.tableWrapper}>
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
              {coupons.map((c) => {
                const expired = isExpired(c.ValidTill);

                return (
                  <tr key={c.id}>
                    <td><strong>{c.couponName}</strong></td>
                    <td>{c.ValueType}</td>
                    <td>
                      {c.ValueType === "percentage"
                        ? `${c.Value}%`
                        : `₹${c.Value}`}
                    </td>
                    <td>₹{c.minimumSpent}</td>
                    <td>{c.usedByCount}</td>
                    <td>
                      {c.validFrom} → {c.ValidTill}
                    </td>
                    <td>
                      <span
                        className={
                          expired
                            ? styles.expired
                            : styles.active
                        }
                      >
                        {expired ? "Expired" : "Valid"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                        <FiEdit
                            className={styles.actionIcon}
                            title="Edit Coupon"
                            onClick={() => {
                            setEditId(c.id);
                            setShowModal(true);
                            }}
                        />

                        <FiTrash color="red"
                            className={styles.actionIcon}
                            title="Delete Coupon"
                            onClick={() => handleDelete(c.id)}
                        />
                        </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
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
        <CouponFormModal
            open={showModal}
            couponId={editId}
            onClose={() => setShowModal(false)}
            onSuccess={fetchCoupons}
        />
      </div>
    </div>
  );
}
