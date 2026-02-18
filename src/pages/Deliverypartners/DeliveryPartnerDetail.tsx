import styles from "./DeliveryPartners.module.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { useToast } from "@/components/toast/ToastContext";

/* ---------------- TYPES ---------------- */
interface DeliveryPartner {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  AdminProfile: {
    name: string;
    phone: string | null;
    profilePicture: string | null;
    notes: string | null;
  } | null;
}

interface AnalyticsData {
  partner: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalItems: number;
    completedOrders: number;
    completedRevenue: number;
    averageOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  ordersByPaymentStatus: Record<string, number>;
  recentOrders: any[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  createdAt: string;
  updatedAt: string;
  CustomerProfile: {
    name: string;
    phone: string;
    user: {
      email: string;
    };
  };
  shippingAddress: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark: string | null;
    phone: string | null;
  };
  tracking: {
    status: string;
    trackingNumber: string;
    lastUpdatedAt: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    discountedPrice: string;
    actualPrice: string;
    product: {
      id: string;
      name: string;
      images: any[];
    };
  }>;
}

/* ---------------- COMPONENT ---------------- */
export default function DeliveryPartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "completed" | "manage"
  >("profile");

  /* Edit mode */
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* Delete confirmation */
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchPartnerDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(`/delivery-partners/${id}`);
      const partnerData: DeliveryPartner = res.data.data;
      setPartner(partnerData);

      setEditForm({
        name: partnerData.AdminProfile?.name || "",
        email: partnerData.email,
        password: "",
      });
    } catch (error) {
      console.error("Failed to fetch partner details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!id) return;

    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(
        new Date().setMonth(new Date().getMonth() - 1)
      )
        .toISOString()
        .split("T")[0];

      const res = await api.get("/delivery-partners/analytics/stats", {
        params: {
          partnerId: id,
          startDate,
          endDate,
        },
      });

      setAnalytics(res.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const fetchOrders = async () => {
    if (!id) return;

    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(
        new Date().setMonth(new Date().getMonth() - 1)
      )
        .toISOString()
        .split("T")[0];

      const res = await api.get("/delivery-partners/analytics/orders", {
        params: {
          partnerId: id,
          startDate,
          endDate,
        },
      });

      setOrders(res.data.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchPartnerDetails();
    fetchAnalytics();
    fetchOrders();
  }, [id]);

  /* ---------------- HANDLERS ---------------- */
  const handleUpdate = async () => {
    if (!id) return;

    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      await api.patch(`/delivery-partners/${id}`, payload);

      showToast("Delivery partner updated successfully", "success");
      setIsEditing(false);
      fetchPartnerDetails();
    } catch (error) {
      console.error("Failed to update partner", error);
      showToast("Failed to update delivery partner", "error");
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await api.delete(`/delivery-partners/${id}`);
      showToast("Delivery partner deleted successfully", "success");
      navigate("/deliveryPartner");
    } catch (error) {
      console.error("Failed to delete partner", error);
      showToast("Failed to delete delivery partner", "error");
    }
  };

  /* ---------------- RENDER TABS ---------------- */
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className={styles.profileSection}>
            <h3>Personal Information</h3>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>Full Name</label>
                <div>{partner?.AdminProfile?.name || "—"}</div>
              </div>
              <div className={styles.profileField}>
                <label>Email Address</label>
                <div>{partner?.email || "—"}</div>
              </div>
              <div className={styles.profileField}>
                <label>Phone Number</label>
                <div>{partner?.AdminProfile?.phone || "—"}</div>
              </div>
              <div className={styles.profileField}>
                <label>Role</label>
                <div>{partner?.role || "—"}</div>
              </div>
              <div className={styles.profileField}>
                <label>Status</label>
                <div>
                  <span
                    className={
                      partner?.isActive ? styles.active : styles.inactive
                    }
                  >
                    {partner?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className={styles.profileField}>
                <label>Joined Date</label>
                <div>
                  {partner?.createdAt
                    ? new Date(partner.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>

            {partner?.AdminProfile?.notes && (
              <div className={styles.profileField}>
                <label>Notes</label>
                <div>{partner.AdminProfile.notes}</div>
              </div>
            )}
          </div>
        );

      case "orders":
        return (
          <div className={styles.ordersSection}>
            <h3>All Orders</h3>
            {orders.length === 0 ? (
              <p className={styles.emptyState}>No orders found</p>
            ) : (
              <div className={styles.ordersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>
                          <div>{order.CustomerProfile.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {order.CustomerProfile.user.email}
                          </div>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                        <td>QAR {parseFloat(order.totalAmount).toFixed(2)}</td>
                        <td>
                          <span className={styles.paymentStatus}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={styles.orderStatus}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "completed":
        const completedOrders = orders.filter(
          (o) => o.status === "delivered" || o.status === "completed"
        );
        const returnedOrders = orders.filter(
          (o) => o.status === "returned" || o.status === "cancelled"
        );

        return (
          <div className={styles.ordersSection}>
            <h3>Completed Orders</h3>
            {completedOrders.length === 0 ? (
              <p className={styles.emptyState}>No completed orders</p>
            ) : (
              <div className={styles.ordersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>
                          <div>{order.CustomerProfile.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {order.CustomerProfile.user.email}
                          </div>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                        <td>QAR {parseFloat(order.totalAmount).toFixed(2)}</td>
                        <td>
                          <span className={styles.paymentStatus}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={styles.orderStatus}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 style={{ marginTop: 32 }}>Returned Orders</h3>
            {returnedOrders.length === 0 ? (
              <p className={styles.emptyState}>No returned orders</p>
            ) : (
              <div className={styles.ordersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>
                          <div>{order.CustomerProfile.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {order.CustomerProfile.user.email}
                          </div>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                        <td>QAR {parseFloat(order.totalAmount).toFixed(2)}</td>
                        <td>
                          <span className={styles.paymentStatus}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={styles.orderStatus}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "manage":
        return (
          <div className={styles.manageSection}>
            <h3>Manage Delivery Partner</h3>

            {!isEditing ? (
              <div className={styles.manageActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Details
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FiTrash2 /> Delete Partner
                </button>
              </div>
            ) : (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.saveBtn} onClick={handleUpdate}>
                    Save Changes
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: partner?.AdminProfile?.name || "",
                        email: partner?.email || "",
                        password: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: 40 }}>
          Loading partner details...
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: 40 }}>
          Partner not found
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.headerInfo}>
          <h1>{partner.AdminProfile?.name || partner.email}</h1>
          <p>{partner.email}</p>
        </div>
      </div>

      {/* STATS */}
      {analytics && (
        <div className={styles.stats}>
          <StatCard
            title="Total Orders"
            value={analytics.summary.totalOrders.toString()}
          />
          <StatCard
            title="Completed Orders"
            value={analytics.summary.completedOrders.toString()}
          />
          <StatCard
            title="Total Revenue"
            value={`QAR ${analytics.summary.totalRevenue.toLocaleString(
              "en-US",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`}
          />
          <StatCard
            title="Average Order Value"
            value={`QAR ${analytics.summary.averageOrderValue.toLocaleString(
              "en-US",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`}
          />
        </div>
      )}

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "profile" ? styles.activeTab : ""}
          onClick={() => setActiveTab("profile")}
        >
          Full Profile
        </button>
        <button
          className={activeTab === "orders" ? styles.activeTab : ""}
          onClick={() => setActiveTab("orders")}
        >
          Total Orders
        </button>
        <button
          className={activeTab === "completed" ? styles.activeTab : ""}
          onClick={() => setActiveTab("completed")}
        >
          Completed & Returned
        </button>
        <button
          className={activeTab === "manage" ? styles.activeTab : ""}
          onClick={() => setActiveTab("manage")}
        >
          Manage
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className={styles.tabContent}>{renderTabContent()}</div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Delivery Partner</h3>
            <p>
              Are you sure you want to delete this delivery partner? This
              action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete}>
                Delete
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <span>{title}</span>
      <h3>{value}</h3>
    </div>
  );
}