import styles from "./OrderDetails.module.css";
import { FiArrowLeft, FiDownload, FiPrinter, FiEdit2, FiUser, FiX, FiCheck } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/toast/ToastContext";
import { generateInvoice } from "../../utils/generateInvoice";
import api from "../../services/api";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";

interface TrackingHistory {
  status: string;
  notes: string;
  timestamp: string;
}

interface TrackingDetails {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  status: string;
  statusHistory?: TrackingHistory[] | null;
  lastUpdatedAt: string;
}

interface DeliveryPartner {
  id: string;
  email: string;
  AdminProfile: {
    name: string;
    phone: string | null;
  };
}

/* ================= API HELPERS ================= */
const getOrderById = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};

const getTrackingByOrderId = async (orderId: string) => {
  const res = await api.get(`/tracking/order/${orderId}`);
  return res.data.data;
};

const createTracking = async (payload: {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
}) => {
  const res = await api.post("/tracking-details", payload);
  return res.data.data;
};

const updateTrackingStatus = async (
  orderId: string,
  status: string,
  notes?: string
) => {
  const res = await api.patch(`/tracking/order/${orderId}/status`, {
    status,
    notes,
  });
  return res.data.data.tracking;
};

const resetOrderTracking = async (orderId: string) => {
  const res = await api.post(`/tracking/order/${orderId}/reset`);
  return res.data.data;
};

const getAllDeliveryPartners = async () => {
  const res = await api.get(`/delivery-partners`);
  return res.data.data as DeliveryPartner[];
};

const assignDeliveryPartner = async (
  orderId: string,
  deliveryPartnerId: string
) => {
  const res = await api.patch(`/orders/${orderId}/assign-delivery-partner`, {
    deliveryPartnerId,
  });
  return res.data.data.data; 
};

/* ================= VALIDATION TYPES ================= */
interface ValidationResult {
  isValid: boolean;
  message?: string;
  requiresConfirmation?: boolean;
  warningMessage?: string;
}

/* ================= COMPONENT ================= */
export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState<TrackingDetails | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showCreateTracking, setShowCreateTracking] = useState(false);
  const { showToast } = useToast();
  const [trackingForm, setTrackingForm] = useState({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  // Delivery partner states
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);

  // Modal states
  const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    status: string;
    validation: ValidationResult;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const FRONTEND_TO_BACKEND_STATUS: Record<string, string> = {
    order_placed: "order_placed",
    processing: "processing",
    ready_to_ship: "ready_to_ship",
    shipped: "shipped",
    in_transit: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    failed_delivery: "failed_delivery",
    returned: "returned",
  };

  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    order_placed: ["processing", "failed_delivery"],
    processing: ["ready_to_ship", "failed_delivery"],
    ready_to_ship: ["shipped", "failed_delivery"],
    shipped: ["in_transit", "failed_delivery"],
    in_transit: ["out_for_delivery", "failed_delivery"],
    out_for_delivery: ["delivered", "failed_delivery"],
    delivered: ["returned"],
    failed_delivery: ["returned", "out_for_delivery"],
    cancelled: [],
    returned: [],
  };

  /* ================= E-COMMERCE VALIDATIONS ================= */
  const validateStatusChange = (
    currentStatus: string,
    nextStatus: string,
    orderData: any,
    trackingData: TrackingDetails | null
  ): ValidationResult => {
    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedStatuses.includes(nextStatus)) {
      return {
        isValid: false,
        message: `Cannot change status from "${currentStatus.replace(/_/g, " ")}" to "${nextStatus.replace(/_/g, " ")}". This transition is not allowed.`,
      };
    }
    if (currentStatus === "delivered" && nextStatus !== "returned") {
      return { isValid: false, message: "Delivered orders can only be marked as returned." };
    }
    if (currentStatus === "cancelled") {
      return { isValid: false, message: "Cancelled orders cannot be modified." };
    }
    if (nextStatus === "shipped") {
      if (!trackingData?.trackingNumber) {
        return { isValid: false, message: "Cannot mark as shipped: Tracking number is required." };
      }
      if (!trackingData.carrier) {
        return { isValid: false, message: "Cannot mark as shipped: Carrier information is required." };
      }
      return {
        isValid: true, requiresConfirmation: true,
        warningMessage: `Mark order as shipped with ${trackingData.carrier} (${trackingData.trackingNumber})?`,
      };
    }
    if (nextStatus === "out_for_delivery") {
      return { isValid: true, requiresConfirmation: true, warningMessage: "Mark order as out for delivery? Customer will be notified." };
    }
    if (nextStatus === "delivered") {
      return { isValid: true, requiresConfirmation: true, warningMessage: "Confirm order delivery? This action is final." };
    }
    if (nextStatus === "returned") {
      return { isValid: true, requiresConfirmation: true, warningMessage: "Process return for this order?" };
    }
    if (nextStatus === "failed_delivery") {
      return { isValid: true, requiresConfirmation: true, warningMessage: "Mark delivery as failed?" };
    }
    if (nextStatus === "processing" && orderData.paymentStatus !== "paid" && orderData.paymentMethod !== "cash_on_delivery") {
      return { isValid: false, message: "Cannot process order: Payment not confirmed." };
    }
    if (nextStatus === "ready_to_ship") {
      return { isValid: true, requiresConfirmation: true, warningMessage: "Mark order as ready to ship?" };
    }
    return { isValid: true, requiresConfirmation: true, warningMessage: `Change order status to "${nextStatus.replace(/_/g, " ")}"?` };
  };

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setTracking(data.tracking ?? null);
        setDeliveryPartner(data.deliveryPartner ?? null);
        if (data.deliveryPartner) setSelectedPartnerId(data.deliveryPartner.id);
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
      try {
        const trackingData = await getTrackingByOrderId(orderId);
        setTracking(trackingData);
      } catch {
        setTracking(null);
      }
    };
    fetchOrder();
  }, [orderId]);

  /* ================= DELIVERY PARTNER HANDLERS ================= */
  const openAssignModal = async () => {
    setShowAssignModal(true);
    setPartnersLoading(true);
    try {
      const partners = await getAllDeliveryPartners();
      setDeliveryPartners(partners);
      if (deliveryPartner) setSelectedPartnerId(deliveryPartner.id);
    } catch {
      showToast("Failed to load delivery partners", "error");
    } finally {
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
      setOrder((prev: any) => ({ ...prev, deliveryPartner: updated.deliveryPartner }));
      showToast("Delivery partner assigned successfully", "success");
      setShowAssignModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to assign delivery partner", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  /* ================= EVENT HANDLERS ================= */
  const handleStatusChangeRequest = (newStatus: string) => {
    if (!tracking) return;
    const validation = validateStatusChange(tracking.status, newStatus, order, tracking);
    if (!validation.isValid) {
      showToast(validation.message || "Invalid status change", "error");
      return;
    }
    if (validation.requiresConfirmation) {
      setPendingStatusChange({ status: newStatus, validation });
      setShowStatusChangeConfirm(true);
    } else {
      executeStatusChange(newStatus);
    }
  };

  const executeStatusChange = async (newStatus: string) => {
    try {
      const backendStatus = FRONTEND_TO_BACKEND_STATUS[newStatus] || newStatus;
      const notes = `Status changed to ${newStatus.replace(/_/g, " ")} by admin`;
      const updated = await updateTrackingStatus(order.id, backendStatus, notes);
      setTracking(updated);
      showToast(`Order status updated to ${newStatus.replace(/_/g, " ")}`, "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setShowStatusChangeConfirm(false);
      setPendingStatusChange(null);
    }
  };

  const handleResetTracking = async () => {
    try {
      const resetData = await resetOrderTracking(order.id);
      setTracking(resetData);
      showToast("Order tracking has been reset to initial state", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reset order tracking", "error");
    } finally {
      setShowResetConfirm(false);
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
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create tracking", "error");
    } finally {
      setTrackingLoading(false);
    }
  };

  /* ================= RENDER HELPERS ================= */
  if (loading) return <div className={styles.loading}>Loading order…</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!order) return <div className={styles.error}>Order not found</div>;

  const itemsTotal = order.items.reduce((sum: number, item: any) => {
    return sum + Number(item.product.discountedPrice) * item.quantity;
  }, 0);
  const couponDiscount = order.coupun ? Number(order.coupun.Value) : 0;
  const subtotalAfterDiscount = itemsTotal - couponDiscount;
  const shippingCost = Number(order.shippingCost || 0);
  const taxAmount = Number(order.taxAmount || 0);
  const finalTotal = subtotalAfterDiscount + shippingCost + taxAmount;

  const currentStatus = tracking?.status;
  const allowedNextStatuses =
    currentStatus && ALLOWED_TRANSITIONS[currentStatus]
      ? ALLOWED_TRANSITIONS[currentStatus]
      : [];
  const isFinalState =
    currentStatus === "delivered" ||
    currentStatus === "cancelled" ||
    currentStatus === "returned";
  const canResetTracking =
    tracking && !["delivered", "cancelled", "returned"].includes(tracking.status);

  /* ================= UI ================= */
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h2 className={styles.title}>Order #{order.orderNumber}</h2>
            <p className={styles.subtitle}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.actionBtn} onClick={() => generateInvoice(order)}>
            <FiDownload size={15} /> Download Invoice
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => {
              generateInvoice(order);
              setTimeout(() => window.print(), 500);
            }}
          >
            <FiPrinter size={15} /> Print
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* LEFT */}
        <div className={styles.left}>
          {/* ORDER ITEMS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Order Items</h3>
            <div className={styles.items}>
              {order.items.map((item: any) => {
                const product = item.product;
                const image = product.images?.[0]?.url;
                return (
                  <div key={item.id} className={styles.item}>
                    <img
                      src={image}
                      alt={product.name}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{product.name}</p>
                      <p className={styles.itemSku}>SKU: {product.sku ?? "—"}</p>
                      <p className={styles.itemPrice}>
                        QAR {product.discountedPrice} × {item.quantity}
                      </p>
                    </div>
                    <div className={styles.itemTotal}>
                      QAR {(Number(product.discountedPrice) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Items Total</span>
                <span>QAR {itemsTotal.toFixed(2)}</span>
              </div>
              {order.coupun && (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Coupon ({order.coupun.couponName})</span>
                  <span>− QAR {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Subtotal after discount</span>
                <span>QAR {subtotalAfterDiscount.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>QAR {shippingCost.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax</span>
                <span>QAR {taxAmount.toFixed(2)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total Payable</span>
                <span>QAR {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SHIPPING INFORMATION */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Shipping Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Tracking Number</label>
                <p>{tracking?.trackingNumber ?? "Not Assigned"}</p>
              </div>
            </div>
            <div className={styles.address}>
              <label>Shipping Address</label>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}</p>
              <p>{order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* ORDER TRACKING */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Order Tracking</h3>
            </div>

            {!tracking ? (
              <>
                <div className={styles.noTracking}>
                  <p>Tracking not created for this order</p>
                  <button
                    className={styles.createBtn}
                    onClick={() => setShowCreateTracking(!showCreateTracking)}
                  >
                    {showCreateTracking ? "Cancel" : "Create Tracking"}
                  </button>
                </div>
                {showCreateTracking && (
                  <div className={styles.trackingForm}>
                    <input
                      placeholder="Carrier (e.g. FedEx)"
                      value={trackingForm.carrier}
                      onChange={(e) =>
                        setTrackingForm({ ...trackingForm, carrier: e.target.value })
                      }
                    />
                    <input
                      placeholder="Tracking Number"
                      value={trackingForm.trackingNumber}
                      onChange={(e) =>
                        setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })
                      }
                    />
                    <input
                      placeholder="Tracking URL (optional)"
                      value={trackingForm.trackingUrl}
                      onChange={(e) =>
                        setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })
                      }
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={handleCreateTracking}
                      disabled={trackingLoading}
                    >
                      {trackingLoading ? "Creating..." : "Save Tracking"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.trackingInfo}>
                  <div className={styles.trackingDetail}>
                    <label>Carrier</label>
                    <p>{tracking.carrier}</p>
                  </div>
                  <div className={styles.trackingDetail}>
                    <label>Tracking Number</label>
                    <p>{tracking.trackingNumber}</p>
                  </div>
                  <div className={styles.trackingDetail}>
                    <label>Status</label>
                    <span className={styles.statusBadge}>
                      {tracking.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {tracking.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.trackingLink}
                  >
                    View on carrier site →
                  </a>
                )}

                {isFinalState && (
                  <div className={styles.lockedNotice}>
                    ⚠️ Order is in final state: {currentStatus?.replace(/_/g, " ")}
                  </div>
                )}

                <div className={styles.statusUpdate}>
                  <label>Update Order Status</label>
                  <select
                    className={styles.statusSelect}
                    value=""
                    onChange={(e) => handleStatusChangeRequest(e.target.value)}
                    disabled={isFinalState && currentStatus !== "delivered"}
                  >
                    <option value="" disabled>
                      {tracking.status.replace(/_/g, " ")} (current)
                    </option>
                    {allowedNextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {allowedNextStatuses.length === 0 && !isFinalState && (
                    <p className={styles.noTransitions}>No status transitions available</p>
                  )}
                </div>

                <div className={styles.timeline}>
                  <h3>Status History</h3>
                  {tracking.statusHistory && tracking.statusHistory.length > 0 ? (
                    tracking.statusHistory.map((h, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <div className={styles.timelineMarker} />
                        <div className={styles.timelineContent}>
                          <h4>{h.status.replace(/_/g, " ")}</h4>
                          <p>{h.notes}</p>
                          <span className={styles.timelineDate}>
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noHistory}>No tracking history available</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          {/* CUSTOMER INFORMATION */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Customer Information</h3>
            <strong>{order.shippingAddress?.name}</strong>
            <p>{order.shippingAddress?.phone}</p>
            <p>
              {order.shippingAddress?.address}, {order.shippingAddress?.city}
            </p>
          </div>

          {/* DELIVERY PARTNER */}
          <div className={styles.card}>
            <div className={styles.dpCardHeader}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Delivery Partner</h3>
              <button className={styles.dpEditBtn} onClick={openAssignModal}>
                <FiEdit2 size={14} />
                {deliveryPartner ? "Reassign" : "Assign"}
              </button>
            </div>

            {deliveryPartner ? (
              <div className={styles.dpInfo}>
                <div className={styles.dpAvatar}>
                  <FiUser size={22} />
                </div>
                <div className={styles.dpDetails}>
                  <strong className={styles.dpName}>
                    {deliveryPartner.AdminProfile?.name ?? "—"}
                  </strong>
                  <p className={styles.dpEmail}>{deliveryPartner.email}</p>
                  {deliveryPartner.AdminProfile?.phone && (
                    <p className={styles.dpPhone}>
                      {deliveryPartner.AdminProfile.phone}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.dpEmpty}>
                <FiUser size={32} className={styles.dpEmptyIcon} />
                <p>No delivery partner assigned</p>
                <span>Click Assign to add one</span>
              </div>
            )}
          </div>

          {/* PAYMENT INFORMATION */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Payment Information</h3>
            <p className={styles.paymentMethod}>
              {order.paymentMethod.split("_").join(" ")}
            </p>
            <span className={order.paymentStatus === "paid" || order.paymentStatus === "completed" ? styles.paid : styles.pending}>
              {order.paymentStatus === "paid" || order.paymentStatus === "completed"
                ? "✓ Paid"
                : "⏳ Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* ===== ASSIGN DELIVERY PARTNER MODAL ===== */}
      {showAssignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{deliveryPartner ? "Reassign Delivery Partner" : "Assign Delivery Partner"}</h3>
              <button className={styles.modalClose} onClick={() => setShowAssignModal(false)}>
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {partnersLoading ? (
                <div className={styles.modalLoading}>Loading partners…</div>
              ) : (
                <>
                  {deliveryPartners.length === 0 ? (
                    <p className={styles.modalEmpty}>No delivery partners available.</p>
                  ) : (
                    <div className={styles.partnerList}>
                      {deliveryPartners.map((partner) => {
                        const isSelected = selectedPartnerId === partner.id;
                        const isCurrent = deliveryPartner?.id === partner.id;
                        return (
                          <div
                            key={partner.id}
                            className={`${styles.partnerItem} ${isSelected ? styles.partnerItemSelected : ""}`}
                            onClick={() => setSelectedPartnerId(partner.id)}
                          >
                            <div className={styles.partnerAvatar}>
                              <FiUser size={18} />
                            </div>
                            <div className={styles.partnerItemDetails}>
                              <span className={styles.partnerName}>
                                {partner.AdminProfile?.name ?? "Unnamed"}
                                {isCurrent && (
                                  <span className={styles.currentBadge}>Current</span>
                                )}
                              </span>
                              <span className={styles.partnerEmail}>{partner.email}</span>
                              {partner.AdminProfile?.phone && (
                                <span className={styles.partnerPhone}>
                                  {partner.AdminProfile.phone}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <FiCheck size={18} className={styles.partnerCheck} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleAssignPartner}
                disabled={assignLoading || !selectedPartnerId || partnersLoading}
              >
                {assignLoading ? "Assigning…" : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CHANGE CONFIRMATION MODAL */}
      <ConfirmModal
        open={showStatusChangeConfirm}
        title="Confirm Status Change"
        message={pendingStatusChange?.validation.warningMessage || ""}
        onCancel={() => {
          setShowStatusChangeConfirm(false);
          setPendingStatusChange(null);
        }}
        onConfirm={() => {
          if (pendingStatusChange) {
            executeStatusChange(pendingStatusChange.status);
          }
        }}
      />

      {/* RESET CONFIRMATION MODAL */}
      <ConfirmModal
        open={showResetConfirm}
        title="Reset Tracking"
        message="Are you sure you want to reset this order's tracking to its initial state?"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetTracking}
      />
    </div>
  );
}