import styles from "./DeliveryCharges.module.css";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";

/* ================= TYPES ================= */
interface DeliveryCharge {
  id: string;
  postalCode: string;
  deliveryCharge: string;
  createdAt: string;
}

interface ApiResponse {
  data: DeliveryCharge[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ================= COMPONENT ================= */
export default function DeliveryCharges() {
  const { showToast } = useToast();

  const [data, setData] = useState<DeliveryCharge[]>([]);
  const [loading, setLoading] = useState(true);

  /* filters */
  const [search, setSearch] = useState("");

  /* pagination */
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  /* modals */
  const [showCreate, setShowCreate] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);

  /* create/edit form */
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  const [postalInput, setPostalInput] = useState("");
  const [charge, setCharge] = useState("");

  /* ================= FETCH ================= */
  const fetchCharges = async () => {
    try {
      setLoading(true);
      const res = await api.get("/delivery-charges", {
        params: {
          page,
          limit,
          postalCode: search || undefined,
        },
      });

      const payload: ApiResponse = res.data.data;
      setData(payload.data);
      setTotalPages(payload.meta.totalPages);
    } catch {
      showToast("Failed to fetch delivery charges", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, [page, search]);

  /* ================= CREATE ================= */
  const addPostalCode = () => {
    const code = postalInput.trim();
    if (!code) return;
    if (postalCodes.includes(code)) return;

    setPostalCodes((prev) => [...prev, code]);
    setPostalInput("");
    };


  const handleCreate = async () => {
    const finalCodes = [...postalCodes];

    if (postalInput.trim()) {
        if (!finalCodes.includes(postalInput.trim())) {
        finalCodes.push(postalInput.trim());
        }
    }

    if (finalCodes.length === 0) {
        showToast("Please add at least one postal code", "error");
        return;
    }

    try {
        await api.post("/delivery-charges", {
        postalCodes: finalCodes,
        deliveryCharge: Number(charge),
        });

        showToast("Delivery charges added successfully", "success");
        setPostalCodes([]);
        setPostalInput("");
        setCharge("");
        setShowCreate(false);
        fetchCharges();
    } catch {
        showToast("Failed to create delivery charges", "error");
    }
    };


  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!editCode) return;
    try {
      await api.patch(`/delivery-charges/${editCode}`, {
        deliveryCharge: Number(charge),
      });

      showToast("Delivery charge updated", "success");
      setEditCode(null);
      setCharge("");
      fetchCharges();
    } catch {
      showToast("Failed to update delivery charge", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteCode) return;
    try {
      await api.delete(`/delivery-charges/${deleteCode}`);
      showToast("Delivery charge deleted", "success");
      setDeleteCode(null);
      fetchCharges();
    } catch {
      showToast("Failed to delete delivery charge", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Delivery Charges</h1>
          <p>Manage delivery charges by postal code</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <FiPlus /> Add Charges
        </button>
      </div>

      {/* FILTER */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search postal code..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* DATA SECTION */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <table className={styles.desktopTable}>
              <thead>
                <tr>
                  <th>Postal Code</th>
                  <th>Delivery Charge</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id}>
                    <td>{d.postalCode}</td>
                    <td>QAR {d.deliveryCharge}</td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => {
                          setEditCode(d.id);
                          setCharge(d.deliveryCharge);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteCode(d.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MOBILE CARD VIEW */}
            <div className={styles.mobileCards}>
              {data.map((d) => (
                <div key={d.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardCode}>{d.postalCode}</span>
                    <div className={styles.cardActions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => {
                          setEditCode(d.id);
                          setCharge(d.deliveryCharge);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => setDeleteCode(d.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>Charge:</span>
                      <span className={styles.value}>QAR {d.deliveryCharge}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.label}>Created:</span>
                      <span className={styles.value}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(showCreate || editCode) && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>{editCode ? "Edit Delivery Charge" : "Add Delivery Charges"}</h3>

            {!editCode && (
              <div className={styles.chipInput}>
                {postalCodes.map((c) => (
                  <span key={c} className={styles.chip}>
                    {c}
                    <FiX onClick={() =>
                      setPostalCodes(postalCodes.filter(p => p !== c))
                    } />
                  </span>
                ))}
                <input
                  value={postalInput}
                  placeholder="Enter postal code"
                  onChange={(e) => setPostalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPostalCode();
                    }
                  }}
                />
              </div>
            )}

            <input
              type="number"
              placeholder="Delivery Charge (QAR)"
              className={styles.modalInput}
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowCreate(false);
                  setEditCode(null);
                  setPostalCodes([]);
                  setCharge("");
                }}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={editCode ? handleUpdate : handleCreate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        open={!!deleteCode}
        title="Delete Delivery Charge"
        message="Are you sure you want to delete this delivery charge?"
        confirmText="Delete"
        onCancel={() => setDeleteCode(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}