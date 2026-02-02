import styles from "../coupons/Coupons.module.css";
import { FiTrash } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
import { type LeadLogDTO } from "./types";

export default function LeadLogs() {
  const [logs, setLogs] = useState<LeadLogDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { showToast } = useToast();

  /* ---------------- FETCH ---------------- */
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/lead-logs", {
        params: { page, limit, leadId, action },
      });

      setLogs(res.data.data.data);
      setTotalPages(res.data.data.meta.totalPages);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message?.[0] || "Failed to load lead logs",
        "error"
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, leadId, action]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/lead-logs/${deleteId}`);
      setLogs((prev) => prev.filter((l) => l.id !== deleteId));
      showToast("Lead log deleted successfully", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to delete lead log",
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
          <h1>Lead Logs</h1>
          <p>System activity history for leads</p>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Description</th>
                <th>Lead</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong>{log.action}</strong>
                    </td>
                    <td>{log.description}</td>
                    <td>
                      <div>
                        <div>{log.lead?.name}</div>
                        <small style={{ color: "#6b7280" }}>
                          {log.lead?.email}
                        </small>
                      </div>
                    </td>
                    <td>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className={styles.actions}>
                      <FiTrash
                        style={{ color: "red" }}
                        onClick={() => {
                          setDeleteId(log.id);
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
        {/* MOBILE CARDS */}
          <div className={styles.mobileCards}>
            {loading ? (
              <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                Loading logs...
              </p>
            ) : logs.length === 0 ? (
              <p style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                No logs found
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={styles.couponCard}>
                  {/* HEADER */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{log.action}</h3>

                    <div className={styles.cardActions}>
                      <FiTrash
                        className={styles.actionIcon}
                        style={{ color: "red" }}
                        onClick={() => {
                          setDeleteId(log.id);
                          setShowDeleteConfirm(true);
                        }}
                      />
                    </div>
                  </div>

                  {/* BODY */}
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Description</span>
                    <span className={styles.cardValue}>{log.description}</span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Lead</span>
                    <span className={styles.cardValue}>
                      <div>{log.lead?.name}</div>
                      <small style={{ color: "#6b7280" }}>{log.lead?.email}</small>
                    </span>
                  </div>

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Created</span>
                    <span className={styles.cardValue}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

      </div>

      {/* CONFIRM DELETE */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete log?"
        message="Are you sure you want to delete this lead log entry?"
        confirmText="Delete"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
