import styles from "./OrderDetails.module.css";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/toast/ToastContext";
import api from "../../services/api";

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

const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await api.patch(`/orders/${orderId}/status`, {
    status,
  });
  return res.data.data;
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
  const res = await api.patch(
    `/tracking/order/${orderId}/status`,
    { status, notes }
  );
  return res.data.data.tracking;
}
/* ================= COMPONENT ================= */

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false); 
  const [tracking, setTracking] = useState<TrackingDetails | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showCreateTracking, setShowCreateTracking] = useState(false);
  const { showToast } = useToast();
  const [trackingForm, setTrackingForm] = useState({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
  });

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

  /* ================= STATES ================= */

  if (loading) return <p className={styles.loading}>Loading order…</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!order) return <p className={styles.error}>Order not found</p>;

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft />
        </button>

        <div>
          <h2>Order #{order.orderNumber}</h2>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className={styles.headerActions}>
          <button>
            <FiDownload /> Download Invoice
          </button>
          <button>
            <FiPrinter /> Print
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* LEFT */}
        <div>
          {/* ORDER STATUS */}
          <div className={styles.card}>
            <h3>Order Status</h3>

            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (newStatus === order.status) return;

                try {
                  setUpdatingStatus(true);

                  const updated = await updateOrderStatus(
                    order.id,
                    newStatus
                  );

                  setOrder((prev: any) => ({
                    ...prev,
                    status: updated.status,
                  }));
                } catch (error) {
                  console.error(error);
                  alert("Failed to update order status");
                } finally {
                  setUpdatingStatus(false);
                }
              }}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className={styles.card}>
  <h3 className={styles.cardTitle}>Order Items</h3>

  <div className={styles.itemsList}>
    {order.items.map((item: any) => {
      const product = item.product;
      const image = product.images?.[0]?.url;

      return (
        <div key={item.id} className={styles.orderItem}>
          <img src={image} alt={product.name} />

          <div className={styles.itemDetails}>
            <h4>{product.name}</h4>
            <p className={styles.sku}>SKU: {product.sku ?? "—"}</p>
            <p className={styles.qtyPrice}>
              QAR {product.discountedPrice} × {item.quantity}
            </p>
          </div>

          <div className={styles.itemPrice}>
            QAR {(
              Number(product.discountedPrice) * item.quantity
            ).toFixed(2)}
          </div>
        </div>
      );
    })}
  </div>

  <div className={styles.summary}>
    <div>
      <span>Subtotal</span>
      <span>QAR {order.totalAmount}</span>
    </div>
    <div>
      <span>Shipping</span>
      <span>QAR {order.shippingCost}</span>
    </div>
    <div>
      <span>Tax</span>
      <span>QAR {order.taxAmount}</span>
    </div>

    <div className={styles.totalRow}>
      <span>Total</span>
      <span>QAR {order.totalAmount}</span>
    </div>
  </div>
</div>
<div className={styles.card}>
  <h3>Shipping Information</h3>

  {/* Tracking */}
  <div className={styles.trackingBox}>
    <div>
      <p className={styles.trackingLabel}>Tracking Number</p>
      <a href="#" className={styles.trackingNumber}>
        {tracking?.trackingNumber ?? "Not Assigned"}
      </a>
    </div>

    {tracking?.carrier && (
      <span className={styles.courierBadge}>
        {tracking?.carrier}
      </span>
    )}
  </div>

  {/* Shipping Address */}
  <div className={styles.addressBlock}>
    <h4>Shipping Address</h4>
    <p>{order.shippingAddress?.address}</p>
    <p>{order.shippingAddress?.city}</p>
    <p>{order.shippingAddress?.state}</p>
    <p>{order.shippingAddress?.postalCode}</p>
    <p>{order.shippingAddress?.country}</p>
  </div>

  <hr />

</div>

    {/* ORDER TRACKING */}
    <div className={styles.card}>
      <h3>Order Tracking</h3>
      {!tracking ? (
        <>
          <p className={styles.muted}>
            Tracking not created for this order
          </p>

          {showCreateTracking && (
            <div className={styles.createTrackingForm}>
              <input
                placeholder="Carrier (FedEx, Delhivery, Internal)"
                value={trackingForm.carrier}
                onChange={(e) =>
                  setTrackingForm({
                    ...trackingForm,
                    carrier: e.target.value,
                  })
                }
              />

              <input
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
                className={styles.primaryBtn}
                disabled={trackingLoading}
                onClick={async () => {
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
                  } catch (err) {
                    showToast("Failed to create tracking");
                  } finally {
                    setTrackingLoading(false);
                  }
                }}
              >
                {trackingLoading ? "Creating..." : "Save Tracking"}
              </button>
            </div>
          )}

        </>
      ) : (
        <>
          {/* BASIC INFO */}
          <div className={styles.trackingHeader}>
            <div>
              <strong>{tracking.carrier}</strong>
              <p className={styles.trackingNo}>
                {tracking.trackingNumber}
              </p>
            </div>

            <span className={styles.statusBadge}>
              {tracking.status.replace("_", " ")}
            </span>
          </div>

          {tracking.trackingUrl && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.trackLink}
            >
              View on carrier site →
            </a>
          )}

          {/* UPDATE STATUS */}
          <select
            value={tracking.status}
            onChange={async (e) => {
              const updated = await updateTrackingStatus(
                order.id,
                e.target.value,
                "Status updated by admin"
              );
              setTracking(updated);
            }}
          >
            <option value="order_placed">Order Placed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* TIMELINE */}
          <div className={styles.timeline}>
            {tracking.statusHistory && tracking.statusHistory.length > 0 ? (
              tracking.statusHistory.map((h, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.dot} />
                  <div className={styles.statusStrong}>
                    <strong>{h.status.replace("_", " ")}</strong>
                    <p>{h.notes}</p>
                    <span>
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.muted}>
                No tracking history available
              </p>
            )}
          </div>

        </>
      )}
    </div>


        </div>

        {/* RIGHT */}
        <div>
          <div className={styles.card}>
            <h3>Customer Information</h3>
            <strong>{order.shippingAddress?.name}</strong>
            <p>{order.shippingAddress?.phone}</p>
            <p>
              {order.shippingAddress?.address},{" "}
              {order.shippingAddress?.city}
            </p>
          </div>

          <div className={styles.card}>
            <h3>Payment Information</h3>
            <p className={styles.paymentMethod}>
              {order.paymentMethod.split("_").join(" ")}
            </p>
            <span
              className={`${styles.paid} ${
                order.paymentStatus !== "paid" ? styles.pending : ""
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
