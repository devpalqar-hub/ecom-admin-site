interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    couponId?: string;
}
export default function CouponFormModal({ open, onClose, onSuccess, couponId, }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
