import styles from "../../coupons/couponFormModal/CouponFormModal.module.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useToast } from "../../../components/toast/ToastContext";

interface FormData {
  name: string;
  email: string;
  phone: string;
  purpose: "PURCHASE" | "SUPPORT" | "GENERAL";
  additionalNotes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  enquiryId?: string;
}
``
export default function EnquiryFormModal({
  open,
  onClose,
  onSuccess,
  enquiryId,
}: Props) {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    purpose: "PURCHASE",
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!enquiryId) return;

    const fetchEnquiry = async () => {
        const res = await api.get(`/enquiries/${enquiryId}`);
        const e = res.data.data;

        setForm({
        name: e.name,
        email: e.email,
        phone: e.phone,
        purpose: e.purpose, 
        additionalNotes: e.additionalNotes ?? "",
        });
    };

    fetchEnquiry();
    }, [enquiryId]);


  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (enquiryId) {
        await api.patch(`/enquiries/${enquiryId}`, form);
      } else {
        await api.post("/enquiries", form);
        console.log(form)
      }

      showToast("Enquiry saved successfully", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
  console.error(err?.response?.data);
    showToast(
        err?.response?.data?.message || "Failed to save enquiry",
        "error"
    );
    }
 finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{enquiryId ? "Edit Enquiry" : "Create Enquiry"}</h3>

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
          <label>Purpose</label>
          <select
            value={form.purpose}
            onChange={(e) =>
              setForm({ ...form, purpose: e.target.value as any })
            }
          >
            <option value="PURCHASE">Purchase</option>
            <option value="SUPPORT">Support</option>
            <option value="GENERAL">General</option>
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
