import styles from "../../coupons/couponFormModal/CouponFormModal.module.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useToast } from "../../../components/toast/ToastContext";
import { type LeadFormData } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId?: string;
}

export default function LeadFormModal({
  open,
  onClose,
  onSuccess,
  leadId,
}: Props) {
  const [form, setForm] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    status: "NEW",
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!leadId) return;

    const fetchLead = async () => {
      const res = await api.get(`/leads/${leadId}`);
      const l = res.data.data;

      setForm({
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        additionalNotes: l.additionalNotes ?? "",
      });
    };

    fetchLead();
  }, [leadId]);

  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (leadId) {
        await api.patch(`/leads/${leadId}`, form);
      } else {
        await api.post("/leads", form);
      }

      showToast("Lead saved successfully", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Failed to save lead",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{leadId ? "Edit Lead" : "Create Lead"}</h3>

        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className={styles.field}>
            <label>Status</label>
            <select
                value={form.status}
                onChange={(e) =>
                setForm({ ...form, status: e.target.value as "NEW" | "COMPLETED" })
                }
            >
                <option value="NEW">NEW</option>
                <option value="COMPLETED">COMPLETED</option>
            </select>
            </div>


        <div className={styles.field}>
          <label>Additional Notes</label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) =>
              setForm({ ...form, additionalNotes: e.target.value })
            }
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles.save}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
