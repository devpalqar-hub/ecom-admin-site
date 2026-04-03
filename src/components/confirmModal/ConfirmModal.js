import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./ConfirmModal.module.css";
export default function ConfirmModal({ open, title = "Confirm Action", message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, loading = false, }) {
    if (!open)
        return null;
    return (_jsx("div", { className: styles.overlay, children: _jsxs("div", { className: styles.modal, children: [_jsx("h3", { children: title }), _jsx("p", { children: message }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.cancelBtn, onClick: onCancel, disabled: loading, children: cancelText }), _jsx("button", { className: styles.confirmBtn, onClick: onConfirm, disabled: loading, children: loading ? "Please wait..." : confirmText })] })] }) }));
}
