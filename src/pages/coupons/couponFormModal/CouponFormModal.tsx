import styles from "./CouponFormModal.module.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useToast } from "../../../components/toast/ToastContext";

interface CouponFormData {
  couponName: string;
  ValueType: "percentage" | "amount";
  Value: string;
  minimumSpent: string;
  usageLimitPerPerson: string;
  validFrom: string;
  ValidTill: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  couponId?: string; // present = edit mode
}

export default function CouponFormModal({
  open,
  onClose,
  onSuccess,
  couponId,
}: Props) {
  const [form, setForm] = useState<CouponFormData>({
    couponName: "",
    ValueType: "percentage",
    Value: "",
    minimumSpent: "",
    usageLimitPerPerson: "1",
    validFrom: "",
    ValidTill: "",
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  useEffect(() => {
    if (!couponId) return;

    const fetchCoupon = async () => {
      try {
        const res = await api.get(`/coupons/${couponId}`);
        const c = res.data.data;

        setForm({
          couponName: c.couponName,
          ValueType: c.ValueType,
          Value: c.Value,
          minimumSpent: c.minimumSpent,
          usageLimitPerPerson: c.usageLimitPerPerson.toString(),
          validFrom: c.validFrom,
          ValidTill: c.ValidTill,
        });
      } catch (err) {
        console.error("Failed to load coupon", err);
      }
    };

    fetchCoupon();
  }, [couponId]);

  if (!open) return null;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        couponName: form.couponName,
        ValueType: form.ValueType,
        Value: form.Value,
        minimumSpent: Number(form.minimumSpent),
        usageLimitPerPerson: Number(form.usageLimitPerPerson),
        validFrom: form.validFrom,
        ValidTill: form.ValidTill,
      };

      if (couponId) {
        await api.patch(`/coupons/${couponId}`, payload);
      } else {
        await api.post("/coupons", payload);
      }

      onSuccess();
      showToast("Coupon created successfully", "success");
      onClose();
    } catch (err) {
      showToast("Failed to create coupon", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{couponId ? "Edit Coupon" : "Create Coupon"}</h3>

        <div className={styles.form}>
          <div className={styles.field}>
            <label>Coupon Name</label>
            <input
              value={form.couponName}
              placeholder="SUMMER2026"
              onChange={(e) =>
                setForm({ ...form, couponName: e.target.value })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Discount Type</label>
            <select
              value={form.ValueType}
              onChange={(e) =>
                setForm({
                  ...form,
                  ValueType: e.target.value as "percentage" | "amount",
                })
              }
            >
              <option value="percentage">Percentage</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Discount Value</label>
            <input
              type="number"
              placeholder="20"
              value={form.Value}
              onChange={(e) =>
                setForm({ ...form, Value: e.target.value })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Minimum Spend</label>
            <input
              type="number"
              placeholder="100"
              value={form.minimumSpent}
              onChange={(e) =>
                setForm({ ...form, minimumSpent: e.target.value })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Usage Limit Per Person</label>
            <input
              type="number"
              placeholder="1"
              value={form.usageLimitPerPerson}
              onChange={(e) =>
                setForm({
                  ...form,
                  usageLimitPerPerson: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Validity Period</label>
            <div className={styles.dateRow}>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
              />
              <input
                type="date"
                value={form.ValidTill}
                onChange={(e) =>
                  setForm({ ...form, ValidTill: e.target.value })
                }
              />
            </div>
          </div>
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
            {loading ? "Saving..." : "Save Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}
