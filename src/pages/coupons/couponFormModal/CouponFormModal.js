import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./CouponFormModal.module.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useToast } from "../../../components/toast/ToastContext";
export default function CouponFormModal({ open, onClose, onSuccess, couponId, }) {
    const [form, setForm] = useState({
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
        if (!couponId)
            return;
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
            }
            catch (err) {
                console.error("Failed to load coupon", err);
            }
        };
        fetchCoupon();
    }, [couponId]);
    if (!open)
        return null;
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
            }
            else {
                await api.post("/coupons", payload);
            }
            onSuccess();
            showToast("Coupon created successfully", "success");
            onClose();
        }
        catch (err) {
            showToast("Failed to create coupon", "error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: styles.overlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: couponId ? "Edit Coupon" : "Create Coupon" }), _jsxs("div", { className: styles.form, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Coupon Name" }), _jsx("input", { value: form.couponName, placeholder: "SUMMER2026", onChange: (e) => setForm({ ...form, couponName: e.target.value }) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discount Type" }), _jsxs("select", { value: form.ValueType, onChange: (e) => setForm({
                                        ...form,
                                        ValueType: e.target.value,
                                    }), children: [_jsx("option", { value: "percentage", children: "Percentage" }), _jsx("option", { value: "amount", children: "Amount" })] })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discount Value" }), _jsx("input", { type: "number", placeholder: "20", value: form.Value, onChange: (e) => setForm({ ...form, Value: e.target.value }) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Minimum Spend" }), _jsx("input", { type: "number", placeholder: "100", value: form.minimumSpent, onChange: (e) => setForm({ ...form, minimumSpent: e.target.value }) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Usage Limit Per Person" }), _jsx("input", { type: "number", placeholder: "1", value: form.usageLimitPerPerson, onChange: (e) => setForm({
                                        ...form,
                                        usageLimitPerPerson: e.target.value,
                                    }) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Validity Period" }), _jsxs("div", { className: styles.dateRow, children: [_jsx("input", { type: "date", value: form.validFrom, onChange: (e) => setForm({ ...form, validFrom: e.target.value }) }), _jsx("input", { type: "date", value: form.ValidTill, onChange: (e) => setForm({ ...form, ValidTill: e.target.value }) })] })] })] }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { onClick: onClose, className: styles.cancel, children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: loading, className: styles.save, children: loading ? "Saving..." : "Save Coupon" })] })] }) }));
}
