interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}
export default function ConfirmModal({ open, title, message, confirmText, cancelText, onConfirm, onCancel, loading, }: ConfirmModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
