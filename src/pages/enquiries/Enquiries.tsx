import styles from "../coupons/Coupons.module.css"; 
import { FiSearch, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
import EnquiryFormModal from "./enquiryFormModal/EnquiryFormModal";
import { type Enquiry } from "./types";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ---------------- FETCH ---------------- */
  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/enquiries", {
        params: {
          page,
          limit,
          search: search || undefined,
          purpose: purpose || undefined,
        },
      });

      const payload = res.data.data;
      setEnquiries(payload.data);
      setTotalPages(payload.meta.totalPages);
    } catch (err) {
      showToast("Failed to load enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, search, purpose]);

  /* ---------------- ACTIONS ---------------- */
  const handleCreate = () => {
    setEditId(undefined);
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/enquiries/${deleteId}`);
      setEnquiries((prev) => prev.filter((e) => e.id !== deleteId));
      showToast("Enquiry deleted successfully", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to delete enquiry",
        "error"
      );
    } finally {
      setDeleteId(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Enquiries</h1>
          <p>Manage customer enquiries</p>
        </div>

        <button className={styles.addBtn} onClick={handleCreate}>
          <FiPlus /> Create Enquiry
        </button>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox} style={{ marginBottom: "16px" }}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <select
          value={purpose || ""}
          onChange={(e) => {
            setPage(1);
            setPurpose(e.target.value || undefined);
          }}
        >
          <option value="">All Purposes</option>
          <option value="PURCHASE">Purchase</option>
          <option value="ENQUIRY">Enquiry</option>
          <option value="CUSTOMER_SUPPORT">Customer Support</option>
        </select>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    No enquiries found
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td>{e.phone}</td>
                    <td>{e.purpose}</td>
                    <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      <FiEdit onClick={() => handleEdit(e.id)} />
                      <FiTrash
                        style={{ color: "red" }}
                        onClick={() => {
                          setDeleteId(e.id);
                          setShowDeleteConfirm(true);
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={styles.pageBtn}
            >
              Prev
            </button>

            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={styles.pageBtn}
            >
              Next
            </button>
          </div>
        )}
        {/* MOBILE CARDS */}
          <div className={styles.mobileCards}>
            {loading ? (
              <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                Loading enquiries...
              </p>
            ) : enquiries.length === 0 ? (
              <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                No enquiries found
              </p>
            ) : (
              enquiries.map((e) => (
                <div key={e.id} className={styles.couponCard}>
                  {/* HEADER */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{e.name}</h3>

                    <div className={styles.cardActions}>
                      <FiEdit
                        className={styles.actionIcon}
                        onClick={() => handleEdit(e.id)}
                      />
                      <FiTrash
                        className={styles.actionIcon}
                        style={{ color: "red" }}
                        onClick={() => {
                          setDeleteId(e.id);
                          setShowDeleteConfirm(true);
                        }}
                      />
                    </div>
                  </div>

                  {/* ROWS */}
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Email</span>
                    <span className={styles.cardValue}>{e.email}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Phone</span>
                    <span className={styles.cardValue}>{e.phone}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Purpose</span>
                    <span className={styles.cardValue}>{e.purpose}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Created</span>
                    <span className={styles.cardValue}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

      </div>

      {/* MODALS */}
      <EnquiryFormModal
        open={showModal}
        enquiryId={editId}
        onClose={() => setShowModal(false)}
        onSuccess={fetchEnquiries}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete enquiry?"
        message="This enquiry may be linked to leads and logs. Are you sure?"
        confirmText="Delete"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
