import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styles from "./OrderDetails.module.css";
import { FiArrowLeft, FiDownload, FiPrinter, FiEdit2, FiUser, FiX, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/toast/ToastContext";
import { generateInvoice } from "../../utils/generateInvoice";
import api from "../../services/api";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
/* ================= API HELPERS ================= */
const getOrderById = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
};
const getTrackingByOrderId = async (orderId) => {
    const res = await api.get(`/tracking/order/${orderId}`);
    return res.data.data;
};
const createTracking = async (payload) => {
    const res = await api.post("/tracking-details", payload);
    return res.data.data;
};
const updateTrackingStatus = async (orderId, status, notes) => {
    const res = await api.patch(`/tracking/order/${orderId}/status`, {
        status,
        notes,
    });
    return res.data.data.tracking;
};
const getAllDeliveryPartners = async () => {
    const res = await api.get(`/delivery-partners`);
    return res.data.data;
};
const assignDeliveryPartner = async (orderId, deliveryPartnerId) => {
    const res = await api.patch(`/orders/${orderId}/assign-delivery-partner`, {
        deliveryPartnerId,
    });
    return res.data.data.data;
};
/* ================= ALL POSSIBLE STATUSES ================= */
const ALL_STATUSES = [
    "order_placed",
    "processing",
    "ready_to_ship",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed_delivery",
    "cancelled",
    "returned",
];
/* ================= RETURN STATUS PILL ================= */
const RETURN_STATUS_MAP = {
    pending: { bg: "#fef3c7", color: "#92400e", label: "Return Pending" },
    approved: { bg: "#d1fae5", color: "#065f46", label: "Return Approved" },
    rejected: { bg: "#fee2e2", color: "#991b1b", label: "Return Rejected" },
    completed: { bg: "#e0e7ff", color: "#3730a3", label: "Return Completed" },
};
function ReturnStatusPill({ status }) {
    const s = RETURN_STATUS_MAP[status] ?? { bg: "#f3f4f6", color: "#374151", label: status };
    return (_jsx("span", { className: styles.returnStatusPill, style: { background: s.bg, color: s.color }, children: s.label }));
}
function ReturnModal({ mode, item, onConfirm, onClose }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleConfirm = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for the return.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onConfirm(reason.trim());
        }
        catch (err) {
            setError(err?.response?.data?.message || "Failed to process return. Please try again.");
            setLoading(false);
        }
    };
    const isOrder = mode === "order";
    const mainImage = item?.product?.images?.find((i) => i.isMain)?.url
        ?? item?.product?.images?.[0]?.url;
    return (_jsx("div", { className: styles.returnModalOverlay, onClick: (e) => e.target === e.currentTarget && onClose(), children: _jsxs("div", { className: styles.returnModal, children: [_jsxs("div", { className: styles.returnModalHeader, children: [_jsxs("div", { className: styles.returnModalHeaderLeft, children: [_jsx("div", { className: styles.returnWarningIcon, children: _jsx(FiAlertTriangle, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { children: isOrder ? "Return Entire Order" : "Return Item" }), _jsx("p", { children: isOrder ? "This will mark all items as returned" : item?.product?.name })] })] }), _jsx("button", { className: styles.returnModalClose, onClick: onClose, disabled: loading, children: _jsx(FiX, { size: 18 }) })] }), _jsxs("div", { className: styles.returnWarningBanner, children: [_jsx(FiAlertTriangle, { size: 14 }), _jsx("span", { children: isOrder
                                ? "This action is irreversible. The entire order will be marked as returned and cannot be undone."
                                : "This action is irreversible. Once returned, this item cannot be reverted back." })] }), !isOrder && item && (_jsxs("div", { className: styles.returnItemPreview, children: [mainImage && (_jsx("img", { src: mainImage, alt: item.product?.name, className: styles.returnItemImg })), _jsxs("div", { className: styles.returnItemMeta, children: [_jsx("span", { className: styles.returnItemName, children: item.product?.name }), _jsxs("span", { className: styles.returnItemQty, children: ["Qty: ", item.quantity] })] })] })), _jsxs("div", { className: styles.returnField, children: [_jsxs("label", { children: ["Reason for Return ", _jsx("span", { children: "*" })] }), _jsx("textarea", { className: styles.returnTextarea, rows: 3, placeholder: isOrder ? "Describe why this order is being returned..." : "Describe why this item is being returned...", value: reason, onChange: (e) => { setReason(e.target.value); setError(""); }, disabled: loading }), error && _jsx("p", { className: styles.returnError, children: error })] }), _jsxs("div", { className: styles.returnModalActions, children: [_jsx("button", { className: styles.returnCancelBtn, onClick: onClose, disabled: loading, children: "Cancel" }), _jsx("button", { className: styles.returnConfirmBtn, onClick: handleConfirm, disabled: loading, children: loading ? "Processing..." : isOrder ? "Return Entire Order" : "Confirm Return" })] })] }) }));
}
/* ================= COMPONENT ================= */
export default function OrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tracking, setTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [showCreateTracking, setShowCreateTracking] = useState(false);
    const { showToast } = useToast();
    const [trackingForm, setTrackingForm] = useState({
        carrier: "",
        trackingNumber: "",
        trackingUrl: "",
    });
    // Delivery partner states
    const [deliveryPartner, setDeliveryPartner] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);
    const [partnersLoading, setPartnersLoading] = useState(false);
    // Status change confirm
    const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    // Return modal state
    const [returnModal, setReturnModal] = useState(null);
    const formatStatus = (status) => {
        if (!status)
            return "";
        return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    };
    /* ================= FETCH ORDER ================= */
    const fetchOrder = async () => {
        if (!orderId)
            return;
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
            setTracking(data.tracking ?? null);
            setDeliveryPartner(data.deliveryPartner ?? null);
            if (data.deliveryPartner)
                setSelectedPartnerId(data.deliveryPartner.id);
        }
        catch (err) {
            console.error(err);
            setError("Failed to load order");
        }
        finally {
            setLoading(false);
        }
        try {
            const trackingData = await getTrackingByOrderId(orderId);
            setTracking(trackingData);
        }
        catch {
            setTracking(null);
        }
    };
    useEffect(() => {
        fetchOrder();
    }, [orderId]);
    /* ================= RETURN HANDLER ================= */
    const handleReturn = async (mode, item, reason) => {
        const payload = mode === "order"
            ? {
                orderId: order.id,
                returnType: "full",
                reason,
                items: order.items.map((i) => ({
                    orderItemId: i.id,
                    quantity: i.quantity,
                    reason,
                })),
            }
            : {
                orderId: order.id,
                returnType: "partial",
                reason,
                items: [{ orderItemId: item.id, quantity: item.quantity, reason }],
            };
        await api.post("/returns/admin/direct-return", payload);
        showToast(mode === "order" ? "Order return initiated successfully" : "Item return initiated successfully", "success");
        setReturnModal(null);
        fetchOrder(); // refetch to reflect updated isReturned / returnStatus
    };
    /* ================= DELIVERY PARTNER HANDLERS ================= */
    const openAssignModal = async () => {
        setShowAssignModal(true);
        setPartnersLoading(true);
        try {
            const partners = await getAllDeliveryPartners();
            setDeliveryPartners(partners);
            if (deliveryPartner)
                setSelectedPartnerId(deliveryPartner.id);
        }
        catch {
            showToast("Failed to load delivery partners", "error");
        }
        finally {
            setPartnersLoading(false);
        }
    };
    const handleAssignPartner = async () => {
        if (!selectedPartnerId) {
            showToast("Please select a delivery partner", "error");
            return;
        }
        setAssignLoading(true);
        try {
            const updated = await assignDeliveryPartner(order.id, selectedPartnerId);
            setDeliveryPartner(updated.deliveryPartner ?? null);
            setOrder((prev) => ({ ...prev, deliveryPartner: updated.deliveryPartner }));
            showToast("Delivery partner assigned successfully", "success");
            setShowAssignModal(false);
        }
        catch (err) {
            showToast(err.response?.data?.message || "Failed to assign delivery partner", "error");
        }
        finally {
            setAssignLoading(false);
        }
    };
    /* ================= STATUS CHANGE HANDLERS ================= */
    const handleStatusChangeRequest = (newStatus) => {
        if (!tracking || !newStatus || newStatus === tracking.status)
            return;
        if (newStatus === "returned" && tracking.status !== "delivered") {
            showToast("Only delivered orders can be marked as returned.", "error");
            return;
        }
        setPendingStatus(newStatus);
        setShowStatusChangeConfirm(true);
    };
    const executeStatusChange = async (newStatus) => {
        try {
            const notes = `Status changed to ${formatStatus(newStatus)} by admin`;
            const updated = await updateTrackingStatus(order.id, newStatus, notes);
            setTracking(updated);
            showToast(`Order status updated to ${formatStatus(newStatus)}`, "success");
        }
        catch (err) {
            showToast(err.response?.data?.message || "Failed to update order status", "error");
        }
        finally {
            setShowStatusChangeConfirm(false);
            setPendingStatus("");
        }
    };
    const handleCreateTracking = async () => {
        if (!trackingForm.carrier.trim() || !trackingForm.trackingNumber.trim()) {
            showToast("Carrier and tracking number are required", "error");
            return;
        }
        try {
            setTrackingLoading(true);
            const created = await createTracking({
                orderId: order.id,
                carrier: trackingForm.carrier,
                trackingNumber: trackingForm.trackingNumber,
                trackingUrl: trackingForm.trackingUrl || undefined,
            });
            setTracking(created);
            setShowCreateTracking(false);
            setTrackingForm({ carrier: "", trackingNumber: "", trackingUrl: "" });
            showToast("Tracking information created successfully", "success");
        }
        catch (err) {
            showToast(err.response?.data?.message || "Failed to create tracking", "error");
        }
        finally {
            setTrackingLoading(false);
        }
    };
    /* ================= RENDER HELPERS ================= */
    if (loading)
        return _jsx("div", { className: styles.loading, children: "Loading order\u2026" });
    if (error)
        return _jsx("div", { className: styles.error, children: error });
    if (!order)
        return _jsx("div", { className: styles.error, children: "Order not found" });
    const itemsTotal = order.items.reduce((sum, item) => {
        return sum + Number(item.product.discountedPrice) * item.quantity;
    }, 0);
    const couponDiscount = order.coupun ? Number(order.coupun.Value) : 0;
    const subtotalAfterDiscount = itemsTotal - couponDiscount;
    const shippingCost = Number(order.shippingCost || 0);
    const taxAmount = Number(order.taxAmount || 0);
    const finalTotal = subtotalAfterDiscount + shippingCost + taxAmount;
    const currentStatus = tracking?.status;
    const availableStatuses = ALL_STATUSES.filter((s) => s !== currentStatus);
    // Return logic
    const isDelivered = tracking?.status === "delivered";
    const anyReturned = order.items.some((i) => i.isReturned);
    const showFullReturnBtn = isDelivered && !anyReturned;
    /* ================= UI ================= */
    return (_jsxs("div", { className: styles.container, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { className: styles.headerLeft, children: [_jsx("button", { onClick: () => navigate(-1), className: styles.backBtn, children: _jsx(FiArrowLeft, { size: 18 }) }), _jsxs("div", { children: [_jsxs("h2", { className: styles.title, children: ["Order #", order.orderNumber] }), _jsx("p", { className: styles.subtitle, children: new Date(order.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: styles.headerRight, children: [_jsxs("button", { className: styles.actionBtn, onClick: () => generateInvoice(order), children: [_jsx(FiDownload, { size: 15 }), " Download Invoice"] }), _jsxs("button", { className: styles.actionBtn, onClick: () => { generateInvoice(order); setTimeout(() => window.print(), 500); }, children: [_jsx(FiPrinter, { size: 15 }), " Print"] })] })] }), _jsxs("div", { className: styles.content, children: [_jsxs("div", { className: styles.left, children: [_jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.itemsCardHeader, children: [_jsx("h3", { className: styles.cardTitle, children: "Order Items" }), showFullReturnBtn && (_jsx("button", { className: styles.returnOrderBtn, onClick: () => setReturnModal({ mode: "order" }), children: "Return Entire Order" }))] }), _jsx("div", { className: styles.items, children: order.items.map((item) => {
                                            const product = item.product;
                                            const productVariation = item.productVariation;
                                            const mainImage = product.images?.find((img) => img.isMain)?.url
                                                ?? product.images?.[0]?.url;
                                            return (_jsxs("div", { className: styles.item, children: [_jsx("img", { src: mainImage, alt: product.name, className: styles.itemImage }), _jsxs("div", { className: styles.itemDetails, children: [_jsx("p", { className: styles.itemName, children: product.name }), productVariation && (_jsxs("p", { children: ["Variation: ", productVariation.variationName] })), _jsxs("p", { className: styles.itemSku, children: ["SKU: ", product.sku ?? "—"] }), _jsxs("p", { className: styles.itemPrice, children: ["QAR ", product.discountedPrice, " \u00D7 ", item.quantity] })] }), _jsxs("div", { className: styles.itemRight, children: [_jsxs("div", { className: styles.itemTotal, children: ["QAR ", (Number(product.discountedPrice) * item.quantity).toFixed(2)] }), item.isReturned ? (_jsx(ReturnStatusPill, { status: item.returnStatus })) : isDelivered ? (_jsx("button", { className: styles.returnItemBtn, onClick: () => setReturnModal({ mode: "item", item }), children: "Return Item" })) : null] })] }, item.id));
                                        }) }), _jsxs("div", { className: styles.totals, children: [_jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Items Total" }), _jsxs("span", { children: ["QAR ", itemsTotal.toFixed(2)] })] }), order.coupun && (_jsxs("div", { className: `${styles.totalRow} ${styles.discountRow}`, children: [_jsxs("span", { children: ["Coupon (", order.coupun.couponName, ")"] }), _jsxs("span", { children: ["\u2212 QAR ", couponDiscount.toFixed(2)] })] })), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Subtotal after discount" }), _jsxs("span", { children: ["QAR ", subtotalAfterDiscount.toFixed(2)] })] }), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Shipping" }), _jsxs("span", { children: ["QAR ", shippingCost.toFixed(2)] })] }), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Tax" }), _jsxs("span", { children: ["QAR ", taxAmount.toFixed(2)] })] }), _jsxs("div", { className: `${styles.totalRow} ${styles.grandTotal}`, children: [_jsx("span", { children: "Total Payable" }), _jsxs("span", { children: ["QAR ", finalTotal.toFixed(2)] })] })] })] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { className: styles.cardTitle, children: "Shipping Information" }), _jsx("div", { className: styles.infoGrid, children: _jsxs("div", { className: styles.infoItem, children: [_jsx("label", { children: "Tracking Number" }), _jsx("p", { children: tracking?.trackingNumber ?? "Not Assigned" })] }) }), _jsxs("div", { className: styles.address, children: [_jsx("label", { children: "Shipping Address" }), _jsx("p", { children: order.shippingAddress?.address }), _jsx("p", { children: order.shippingAddress?.city }), _jsx("p", { children: order.shippingAddress?.state }), _jsx("p", { children: order.shippingAddress?.postalCode }), _jsx("p", { children: order.shippingAddress?.country })] })] }), _jsxs("div", { className: styles.card, children: [_jsx("div", { className: styles.cardHeader, children: _jsx("h3", { className: styles.cardTitle, style: { margin: 0 }, children: "Order Tracking" }) }), !tracking ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.noTracking, children: [_jsx("p", { children: "Tracking not created for this order" }), _jsx("button", { className: styles.createBtn, onClick: () => setShowCreateTracking(!showCreateTracking), children: showCreateTracking ? "Cancel" : "Create Tracking" })] }), showCreateTracking && (_jsxs("div", { className: styles.trackingForm, children: [_jsx("input", { placeholder: "Carrier (e.g. FedEx)", value: trackingForm.carrier, onChange: (e) => setTrackingForm({ ...trackingForm, carrier: e.target.value }) }), _jsx("input", { placeholder: "Tracking Number", value: trackingForm.trackingNumber, onChange: (e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value }) }), _jsx("input", { placeholder: "Tracking URL (optional)", value: trackingForm.trackingUrl, onChange: (e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value }) }), _jsx("button", { className: styles.saveBtn, onClick: handleCreateTracking, disabled: trackingLoading, children: trackingLoading ? "Creating..." : "Save Tracking" })] }))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.trackingInfo, children: [_jsxs("div", { className: styles.trackingDetail, children: [_jsx("label", { children: "Carrier" }), _jsx("p", { children: tracking.carrier })] }), _jsxs("div", { className: styles.trackingDetail, children: [_jsx("label", { children: "Tracking Number" }), _jsx("p", { children: tracking.trackingNumber })] }), _jsxs("div", { className: styles.trackingDetail, children: [_jsx("label", { children: "Status" }), _jsx("p", { className: styles.statusBadge, children: formatStatus(tracking.status) })] })] }), tracking.trackingUrl && (_jsx("a", { href: tracking.trackingUrl, target: "_blank", rel: "noreferrer", className: styles.trackingLink, children: "View on carrier site \u2192" })), _jsxs("div", { className: styles.statusUpdate, children: [_jsx("label", { children: "Update Order Status" }), _jsxs("select", { className: styles.statusSelect, value: "", onChange: (e) => handleStatusChangeRequest(e.target.value), children: [_jsxs("option", { value: "", children: [formatStatus(tracking.status), " (Current)"] }), availableStatuses.map((status) => (_jsx("option", { value: status, children: formatStatus(status) }, status)))] })] }), _jsxs("div", { className: styles.timeline, children: [_jsx("h3", { children: "Status History" }), tracking.statusHistory && tracking.statusHistory.length > 0 ? (tracking.statusHistory.map((h, i) => (_jsxs("div", { className: styles.timelineItem, children: [_jsx("div", { className: styles.timelineMarker }), _jsxs("div", { className: styles.timelineContent, children: [_jsx("h4", { children: formatStatus(h.status) }), _jsx("p", { children: h.notes }), _jsx("span", { className: styles.timelineDate, children: new Date(h.timestamp).toLocaleString() })] })] }, i)))) : (_jsx("div", { className: styles.noHistory, children: "No tracking history available" }))] })] }))] })] }), _jsxs("div", { className: styles.right, children: [_jsxs("div", { className: styles.card, children: [_jsx("h3", { className: styles.cardTitle, children: "Customer Information" }), _jsx("strong", { children: order.shippingAddress?.name }), _jsx("p", { children: order.shippingAddress?.phone }), _jsxs("p", { children: [order.shippingAddress?.address, ", ", order.shippingAddress?.city] })] }), _jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.dpCardHeader, children: [_jsx("h3", { className: styles.cardTitle, style: { margin: 0 }, children: "Delivery Partner" }), _jsxs("button", { className: styles.dpEditBtn, onClick: openAssignModal, children: [_jsx(FiEdit2, { size: 14 }), deliveryPartner ? "Reassign" : "Assign"] })] }), deliveryPartner ? (_jsxs("div", { className: styles.dpInfo, children: [_jsx("div", { className: styles.dpAvatar, children: _jsx(FiUser, { size: 22 }) }), _jsxs("div", { className: styles.dpDetails, children: [_jsx("strong", { className: styles.dpName, children: deliveryPartner.AdminProfile?.name ?? "—" }), _jsx("p", { className: styles.dpEmail, children: deliveryPartner.email }), deliveryPartner.AdminProfile?.phone && (_jsx("p", { className: styles.dpPhone, children: deliveryPartner.AdminProfile.phone }))] })] })) : (_jsxs("div", { className: styles.dpEmpty, children: [_jsx(FiUser, { size: 32, className: styles.dpEmptyIcon }), _jsx("p", { children: "No delivery partner assigned" }), _jsx("span", { children: "Click Assign to add one" })] }))] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { className: styles.cardTitle, children: "Payment Information" }), _jsx("p", { className: styles.paymentMethod, children: order.paymentMethod.split("_").join(" ") }), _jsx("span", { className: order.paymentStatus === "paid" || order.paymentStatus === "completed" ? styles.paid : styles.pending, children: order.paymentStatus === "paid" || order.paymentStatus === "completed" ? "✓ Paid" : "⏳ Pending" })] })] })] }), showAssignModal && (_jsx("div", { className: styles.modalOverlay, onClick: () => setShowAssignModal(false), children: _jsxs("div", { className: styles.modal, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: styles.modalHeader, children: [_jsx("h3", { children: deliveryPartner ? "Reassign Delivery Partner" : "Assign Delivery Partner" }), _jsx("button", { className: styles.modalClose, onClick: () => setShowAssignModal(false), children: _jsx(FiX, { size: 18 }) })] }), _jsx("div", { className: styles.modalBody, children: partnersLoading ? (_jsx("div", { className: styles.modalLoading, children: "Loading partners\u2026" })) : (_jsx(_Fragment, { children: deliveryPartners.length === 0 ? (_jsx("p", { className: styles.modalEmpty, children: "No delivery partners available." })) : (_jsx("div", { className: styles.partnerList, children: deliveryPartners.map((partner) => {
                                        const isSelected = selectedPartnerId === partner.id;
                                        const isCurrent = deliveryPartner?.id === partner.id;
                                        return (_jsxs("div", { className: `${styles.partnerItem} ${isSelected ? styles.partnerItemSelected : ""}`, onClick: () => setSelectedPartnerId(partner.id), children: [_jsx("div", { className: styles.partnerAvatar, children: _jsx(FiUser, { size: 18 }) }), _jsxs("div", { className: styles.partnerItemDetails, children: [_jsxs("span", { className: styles.partnerName, children: [partner.AdminProfile?.name ?? "Unnamed", isCurrent && _jsx("span", { className: styles.currentBadge, children: "Current" })] }), _jsx("span", { className: styles.partnerEmail, children: partner.email }), partner.AdminProfile?.phone && (_jsx("span", { className: styles.partnerPhone, children: partner.AdminProfile.phone }))] }), isSelected && _jsx(FiCheck, { size: 18, className: styles.partnerCheck })] }, partner.id));
                                    }) })) })) }), _jsxs("div", { className: styles.modalFooter, children: [_jsx("button", { className: styles.modalCancelBtn, onClick: () => setShowAssignModal(false), disabled: assignLoading, children: "Cancel" }), _jsx("button", { className: styles.modalConfirmBtn, onClick: handleAssignPartner, disabled: assignLoading || !selectedPartnerId || partnersLoading, children: assignLoading ? "Assigning…" : "Confirm Assignment" })] })] }) })), _jsx(ConfirmModal, { open: showStatusChangeConfirm, title: "Confirm Status Change", message: `Change order status to "${formatStatus(pendingStatus)}"?`, onCancel: () => { setShowStatusChangeConfirm(false); setPendingStatus(""); }, onConfirm: () => executeStatusChange(pendingStatus) }), returnModal && (_jsx(ReturnModal, { mode: returnModal.mode, item: returnModal.item, onConfirm: (reason) => handleReturn(returnModal.mode, returnModal.item, reason), onClose: () => setReturnModal(null) }))] }));
}
