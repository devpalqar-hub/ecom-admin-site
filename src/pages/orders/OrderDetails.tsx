import styles from "./OrderDetails.module.css";
import { FiArrowLeft, FiDownload, FiPrinter, FiRefreshCw } from "react-icons/fi";
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

  // Modal states
  const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    status: string;
    validation: ValidationResult;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);


  const formatStatus = (status: string) => {
  if (!status) return "";
  
  return status
    .replace(/_/g, " ")               // replace ALL underscores
    .toLowerCase()                    // normalize
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize words
};



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
  const STATUS_FLOW = [
  "order_placed",
  "processing",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned"
];


  /* ================= E-COMMERCE VALIDATIONS ================= */
  const validateStatusChange = (
    currentStatus: string,
    nextStatus: string,
    orderData: any,
    trackingData: TrackingDetails | null
  ): ValidationResult => {
    // 1. Check if transition is allowed
    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedStatuses.includes(nextStatus)) {
      return {
        isValid: false,
        message: `Cannot change status from "${currentStatus.replace(
          /_/g,
          " "
        )}" to "${nextStatus.replace(/_/g, " ")}". This transition is not allowed.`,
      };
    }

    // 2. Cannot modify delivered orders (except for returns)
    if (currentStatus === "delivered" && nextStatus !== "returned") {
      return {
        isValid: false,
        message: "Delivered orders can only be marked as returned. Contact support for other changes.",
      };
    }

    // 3. Cannot modify cancelled orders
    if (currentStatus === "cancelled") {
      return {
        isValid: false,
        message: "Cancelled orders cannot be modified. Please create a new order.",
      };
    }

    // 4. Validate tracking information before shipping
    if (nextStatus === "shipped") {
      if (!trackingData || !trackingData.trackingNumber) {
        return {
          isValid: false,
          message: "Cannot mark as shipped: Tracking number is required. Please add tracking information first.",
        };
      }
      if (!trackingData.carrier) {
        return {
          isValid: false,
          message: "Cannot mark as shipped: Carrier information is required.",
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: `Mark order as shipped with ${trackingData.carrier} (${trackingData.trackingNumber})? Once shipped, certain fields cannot be modified.`,
      };
    }

    // 5. Validate in_transit transition
    if (nextStatus === "in_transit" && currentStatus !== "shipped") {
      return {
        isValid: false,
        message: "Orders must be marked as 'Shipped' before 'In Transit'.",
      };
    }

    // 6. Validate out_for_delivery transition
    if (nextStatus === "out_for_delivery") {
      if (currentStatus !== "in_transit" && currentStatus !== "failed_delivery") {
        return {
          isValid: false,
          message: "Orders must be 'In Transit' before 'Out for Delivery'.",
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Mark order as out for delivery? Customer will be notified.",
      };
    }

    // 7. Validate delivery
    if (nextStatus === "delivered") {
      if (currentStatus !== "out_for_delivery") {
        return {
          isValid: false,
          message: "Orders must be 'Out for Delivery' before marking as 'Delivered'.",
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Confirm order delivery? This action is final and cannot be easily reversed.",
      };
    }

    // 8. Validate cancellation with restrictions
    if (nextStatus === "cancelled") {
      if (currentStatus === "delivered") {
        return {
          isValid: false,
          message: "Delivered orders cannot be cancelled. Please process a return instead.",
        };
      }
      if (currentStatus === "shipped" || currentStatus === "in_transit" || currentStatus === "out_for_delivery") {
        return {
          isValid: true,
          requiresConfirmation: true,
          warningMessage: `⚠️ WARNING: This order is already in shipping phase (${currentStatus.replace(
            /_/g,
            " "
          )}). Cancelling may incur return shipping costs. Are you sure you want to proceed?`,
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Cancel this order? Customer will be notified and any payment will be refunded.",
      };
    }

    // 9. Validate return
    if (nextStatus === "returned") {
      if (currentStatus !== "delivered" && currentStatus !== "failed_delivery") {
        return {
          isValid: false,
          message: "Only delivered or failed delivery orders can be marked as returned.",
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Process return for this order? Please ensure return policy criteria are met.",
      };
    }

    // 10. Validate failed delivery
    if (nextStatus === "failed_delivery") {
      if (currentStatus !== "out_for_delivery") {
        return {
          isValid: false,
          message: "Only orders 'Out for Delivery' can be marked as failed delivery.",
        };
      }
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Mark delivery as failed? You'll need to reschedule delivery or process a refund.",
      };
    }

    // 11. Payment validation for processing
    if (nextStatus === "processing") {
      if (orderData.paymentStatus !== "paid" && orderData.paymentMethod !== "cash_on_delivery") {
        return {
          isValid: false,
          message: "Cannot process order: Payment not confirmed. Please verify payment status first.",
        };
      }
    }

    // 12. Stock validation for ready_to_ship
    if (nextStatus === "ready_to_ship") {
      // This would ideally check inventory availability
      return {
        isValid: true,
        requiresConfirmation: true,
        warningMessage: "Mark order as ready to ship? Ensure all items are packed and labeled.",
      };
    }

    // Default: Allow with confirmation
    return {
      isValid: true,
      requiresConfirmation: true,
      warningMessage: `Change order status to "${nextStatus.replace(/_/g, " ")}"?`,
    };
  };
  const getRemainingStatuses = (currentStatus: string) => {
  const index = STATUS_FLOW.indexOf(currentStatus);

  if (index === -1) return [];

  let futureStatuses = STATUS_FLOW.slice(index + 1);

  // Special transitions
  if (currentStatus === "out_for_delivery") {
    futureStatuses.push("failed_delivery");
  }

  if (currentStatus === "delivered") {
    futureStatuses.push("returned");
  }

  if (currentStatus === "failed_delivery") {
    futureStatuses.push("out_for_delivery", "returned");
  }

  return futureStatuses;
};


  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setTracking(data.tracking ?? null);
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

  /* ================= EVENT HANDLERS ================= */
  const handleStatusChangeRequest = (newStatus: string) => {
    if (!tracking) return;

    const validation = validateStatusChange(
      tracking.status,
      newStatus,
      order,
      tracking
    );

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
      const notes = `Status changed to ${formatStatus(newStatus)} by admin`;

      
      const updated = await updateTrackingStatus(order.id, backendStatus, notes);
      setTracking(updated);
      showToast(`Order status updated to ${formatStatus(newStatus)}`, "success");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update order status";
      showToast(errorMsg, "error");
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
      const errorMsg = err.response?.data?.message || "Failed to reset order tracking";
      showToast(errorMsg, "error");
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
      const errorMsg = err.response?.data?.message || "Failed to create tracking";
      showToast(errorMsg, "error");
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
  currentStatus ? getRemainingStatuses(currentStatus) : [];

  const isFinalState =
    currentStatus === "delivered" ||
    currentStatus === "cancelled" ||
    currentStatus === "returned";

  const canResetTracking =
    tracking &&
    !["delivered", "cancelled", "returned"].includes(tracking.status);

  /* ================= UI ================= */
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 className={styles.title}>Order #{order.orderNumber}</h1>
            <p className={styles.subtitle}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.actionBtn}
            onClick={() => generateInvoice(order)}
          >
            <FiDownload /> Download Invoice
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => {
              generateInvoice(order);
              setTimeout(() => window.print(), 500);
            }}
          >
            <FiPrinter /> Print
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* LEFT */}
        <div className={styles.left}>
          {/* ORDER ITEMS */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Order Items</h2>
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
                      <p className={styles.itemSku}>
                        SKU: {product.sku ?? "—"}
                      </p>
                      <p className={styles.itemPrice}>
                        QAR {product.discountedPrice} × {item.quantity}
                      </p>
                    </div>
                    <div className={styles.itemTotal}>
                      QAR{" "}
                      {(
                        Number(product.discountedPrice) * item.quantity
                      ).toFixed(2)}
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
                <div className={styles.totalRow}>
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
            <h2 className={styles.cardTitle}>Shipping Information</h2>
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
              <h2 className={styles.cardTitle}>Order Tracking</h2>
              {/* {canResetTracking && (
                <button
                  className={styles.resetBtn}
                  onClick={() => setShowResetConfirm(true)}
                  title="Reset tracking to initial state"
                >
                  <FiRefreshCw /> Reset
                </button>
              )} */}
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
                      type="text"
                      placeholder="Carrier (e.g., DHL, FedEx)"
                      value={trackingForm.carrier}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          carrier: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingForm.trackingNumber}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          trackingNumber: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Tracking URL (optional)"
                      value={trackingForm.trackingUrl}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          trackingUrl: e.target.value,
                        })
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
                {/* BASIC INFO */}
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
                    <p className={styles.statusBadge}>
                      {formatStatus(tracking.status)}

                    </p>
                  </div>
                </div>

                {tracking.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.trackingLink}
                  >
                    View on carrier site →
                  </a>
                )}

                {/* UPDATE STATUS */}
                {isFinalState && (
                  <div className={styles.lockedNotice}>
                    ⚠️ Order is in final state: {formatStatus(currentStatus || "")}


                  </div>
                )}

                <div className={styles.statusUpdate}>
                  <label>Update Order Status</label>
                  <select
                    value={tracking.status}
                    onChange={(e) => handleStatusChangeRequest(e.target.value)}
                    disabled={isFinalState && currentStatus !== "delivered"}
                    className={styles.statusSelect}
                  >
                    <option value={tracking.status}>
                      {formatStatus(tracking.status)} (Current)

                    </option>
                    {allowedNextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}

                      </option>
                    ))}
                  </select>
                  {allowedNextStatuses.length === 0 && !isFinalState && (
                    <p className={styles.noTransitions}>
                      No status transitions available
                    </p>
                  )}
                </div>

                {/* TIMELINE */}
                <div className={styles.timeline}>
                  <h3>Status History</h3>
                  {tracking.statusHistory && tracking.statusHistory.length > 0 ? (
                    tracking.statusHistory.map((h, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        <div className={styles.timelineContent}>
                          <h4>{formatStatus(h.status)}</h4>
                          <p>{h.notes}</p>
                          <span className={styles.timelineDate}>
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noHistory}>
                      No tracking history available
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer Information</h2>
            <p>{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>
              {order.shippingAddress?.address},{" "}
              {order.shippingAddress?.city}
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Payment Information</h2>
            <p>{order.paymentMethod.split("_").join(" ")}</p>
          </div>
        </div>
      </div>

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
        title="Reset Order Tracking"
        message="⚠️ This will reset the order tracking to its initial state. This action should only be used if there was an error in status updates. Are you sure you want to proceed?"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetTracking}
      />
    </div>
  );
}