import styles from "../coupons/Coupons.module.css";
import { FiSearch, FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
import LeadFormModal from "./leadFormModal/LeadFormModal";
import { type LeadDTO } from "./types";

export default function Leads() {
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  // const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { showToast } = useToast();

  /* ---------------- FETCH ---------------- */
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads", {
        params: { search: search || undefined, page, limit }
      });

      setLeads(res.data.data.data);
      console.log("Leads API response:", res.data);
    } catch {
      showToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [ search, page, limit]);

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
      await api.delete(`/leads/${deleteId}`);
      setLeads((prev) => prev.filter((l) => l.id !== deleteId));
      showToast("Lead deleted successfully", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to delete lead",
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
          <h1>Leads</h1>
          <p>Track and manage sales leads</p>
        </div>

        <button className={styles.addBtn} onClick={handleCreate}>
          <FiPlus /> Create Lead
        </button>
      </div>

      {/* FILTER */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search leads..."
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.email}</td>
                    <td>{l.phone}</td>
                    <td>
                      <span className={styles.active}>{l.status}</span>
                    </td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      <FiEdit onClick={() => handleEdit(l.id)} />
                      <FiTrash
                        style={{ color: "red" }}
                        onClick={() => {
                          setDeleteId(l.id);
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
        {/* MOBILE CARDS */}
        <div className={styles.mobileCards}>
          {loading ? (
            <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
              Loading leads...
            </p>
          ) : leads.length === 0 ? (
            <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
              No leads found
            </p>
          ) : (
            leads.map((l) => (
              <div key={l.id} className={styles.couponCard}>
                {/* HEADER */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{l.name}</h3>

                  <div className={styles.cardActions}>
                    <FiEdit
                      className={styles.actionIcon}
                      onClick={() => handleEdit(l.id)}
                    />
                    <FiTrash
                      className={styles.actionIcon}
                      style={{ color: "red" }}
                      onClick={() => {
                        setDeleteId(l.id);
                        setShowDeleteConfirm(true);
                      }}
                    />
                  </div>
                </div>

                {/* BODY */}
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Email</span>
                  <span className={styles.cardValue}>{l.email}</span>
                </div>

                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Phone</span>
                  <span className={styles.cardValue}>{l.phone}</span>
                </div>

                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Status</span>
                  <span className={styles.active}>{l.status}</span>
                </div>

                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Created</span>
                  <span className={styles.cardValue}>
                    {new Date(l.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODALS */}
      <LeadFormModal
        open={showModal}
        leadId={editId}
        onClose={() => setShowModal(false)}
        onSuccess={fetchLeads}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete lead?"
        message="Are you sure you want to delete this lead?"
        confirmText="Delete"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
