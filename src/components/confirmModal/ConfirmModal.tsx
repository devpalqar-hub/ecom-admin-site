import { useEffect, useState } from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function ConfirmModal({
    open,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmModalProps) {
    const [internalLoading, setInternalLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setInternalLoading(false);
        }
    }, [open]);

    if(!open) return null;

    const isBusy = loading || internalLoading;

    const handleConfirmClick = async () => {
        if (isBusy) return;

        try {
            setInternalLoading(true);
            await onConfirm();
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>{title}</h3>
                <p>{message}</p>

                <div className={styles.actions}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onCancel}
                        disabled={isBusy}
                    >
                        {cancelText}
                    </button>

                    <button
                        className={styles.confirmBtn}
                        onClick={handleConfirmClick}
                        disabled={isBusy}
                    >
                        {isBusy ? "Please wait..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
