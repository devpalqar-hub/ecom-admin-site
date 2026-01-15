import styles from "./OrderDetails.module.css";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

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

/* ================= COMPONENT ================= */

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false); // ✅ FIXED

  /* ================= FETCH ORDER ================= */

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
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
              ₹{product.discountedPrice} × {item.quantity}
            </p>
          </div>

          <div className={styles.itemPrice}>
            ₹{(
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
      <span>₹{order.totalAmount}</span>
    </div>
    <div>
      <span>Shipping</span>
      <span>₹{order.shippingCost}</span>
    </div>
    <div>
      <span>Tax</span>
      <span>₹{order.taxAmount}</span>
    </div>

    <div className={styles.totalRow}>
      <span>Total</span>
      <span>₹{order.totalAmount}</span>
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
        {order.trackingNumber ?? "Not Assigned"}
      </a>
    </div>

    {order.courier && (
      <span className={styles.courierBadge}>
        {order.courier}
      </span>
    )}
  </div>

  {/* Shipping Address */}
  <div className={styles.addressBlock}>
    <h4>📍 Shipping Address</h4>
    <p>{order.shippingAddress?.address}</p>
    <p>{order.shippingAddress?.city}</p>
    <p>{order.shippingAddress?.state}</p>
    <p>{order.shippingAddress?.postalCode}</p>
    <p>{order.shippingAddress?.country}</p>
  </div>

  <hr />

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
