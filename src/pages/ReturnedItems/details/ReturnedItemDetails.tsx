import styles from "./ReturnedItemDetails.module.css";
import {
  FiArrowLeft,
  FiUser,
  FiEdit2,
  FiX,
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast/ToastContext";
import api from "@/services/api";

/* ---------------- CONSTANTS ---------------- */
const RETURN_STATUSES = [
  { value: "pending",   label: "Pending" },
  { value: "approved",  label: "Approved" },
  { value: "rejected",  label: "Rejected" },
  { value: "picked_up", label: "Picked Up" },
  { value: "returned",  label: "Returned" },
  { value: "refunded",  label: "Refunded" },
];

/* ---------------- TYPES ---------------- */
interface ReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  quantity: number;
  reason: string;
  orderItem: {
    id: string;
    quantity: number;
    discountedPrice: string;
    actualPrice: string;
    product: {
      name: string;
      images: { url: string; altText: string }[];
    };
    productVariation: {
      variationName: string;
      sku: string;
      discountedPrice: string;
    } | null;
  };
}

interface ReturnDetail {
  id: string;
  orderId: string;
  customerProfileId: string;
  deliveryPartnerId: string | null;
  status: string;
  returnPaymentMethod: string | null;
  returnType: string;
  reason: string;
  refundAmount: string;
  returnFee: string;
  refundMethod: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    orderNumber: string;
    totalAmount: string;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      landmark?: string;
      country: string;
      phone: string;
    };
  };
  customerProfile: {
    name: string;
    phone: string;
    user: { email: string };
  };
  deliveryPartner: {
    id: string;
    email: string;
    AdminProfile: { name: string; phone: string | null };
  } | null;
  returnItems: ReturnItem[];
}

interface DeliveryPartner {
  id: string;
  email: string;
  AdminProfile: { name: string; phone: string | null };
}

/* ---------------- API HELPERS ---------------- */
const getReturnById = async (id: string) => {
  const res = await api.get(`/returns/${id}`);
  return res.data.data as ReturnDetail;
};

const getAllDeliveryPartners = async () => {
  const res = await api.get("/delivery-partners");
  return res.data.data as DeliveryPartner[];
};

/* ---------------- FORMAT HELPERS ---------------- */
const formatStatus = (s: string) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const getStatusClass = (s: string, stylesObj: Record<string, string>) => {
  switch (s) {
    case "pending":   return stylesObj.statusPending;
    case "approved":  return stylesObj.statusApproved;
    case "rejected":  return stylesObj.statusRejected;
    case "picked_up": return stylesObj.statusPickedUp;
    case "returned":  return stylesObj.statusReturned;
    case "refunded":  return stylesObj.statusRefunded;
    default:          return "";
  }
};

/* ---------------- COMPONENT ---------------- */
export default function ReturnedItemDetails() {
  const navigate = useNavigate();
  const { returnId } = useParams();

  const [returnData, setReturnData] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Delivery partner */
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);

  /* Status change */
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const { showToast } = useToast();

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if (!returnId) return;
    const fetchData = async () => {
      try {
        const data = await getReturnById(returnId);
        setReturnData(data);
        setDeliveryPartner(data.deliveryPartner ?? null);
        if (data.deliveryPartner) setSelectedPartnerId(data.deliveryPartner.id);
      } catch (err) {
        console.error(err);
        setError("Failed to load return details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [returnId]);

  /* ---------------- STATUS CHANGE ---------------- */
  const openStatusModal = () => {
    setSelectedStatus(returnData?.status ?? "");
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === returnData?.status) {
      showToast("Please select a different status", "error");
      return;
    }
    setStatusLoading(true);
    try {
      const res = await api.patch(`/returns/admin/${returnId}/status`, {
        status: selectedStatus,
        adminNotes: "NIL",
        returnPaymentMethod: "cash"
      });
      const updated = res.data.data.data;
      setReturnData((prev) =>
        prev
          ? { ...prev, status: updated.status, adminNotes: updated.adminNotes }
          : prev
      );
      showToast("Return status updated successfully", "success");
      setShowStatusModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  /* ---------------- DELIVERY PARTNER HANDLERS ---------------- */
  const openAssignModal = async () => {
    setShowAssignModal(true);
    setPartnersLoading(true);
    try {
      const partners = await getAllDeliveryPartners();
      setDeliveryPartners(partners);
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
      const res = await api.patch(`/returns/${returnId}/assign-delivery-partner`, {
        deliveryPartnerId: selectedPartnerId,
      });
      const updated = res.data.data;
      setDeliveryPartner(updated.deliveryPartner ?? null);
      setReturnData((prev) =>
        prev ? { ...prev, deliveryPartner: updated.deliveryPartner } : prev
      );
      showToast("Delivery partner assigned successfully", "success");
      setShowAssignModal(false);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to assign delivery partner",
        "error"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  /* ---------------- RENDER GUARDS ---------------- */
  if (loading)     return <div className={styles.loading}>Loading return details…</div>;
  if (error)       return <div className={styles.error}>{error}</div>;
  if (!returnData) return <div className={styles.error}>Return not found</div>;

  const { order, customerProfile, returnItems } = returnData;
  const refundAmount = Number(returnData.refundAmount);
  const returnFee    = Number(returnData.returnFee);
  const netRefund    = refundAmount - returnFee;

  /* Hide "Edit Status" once fully terminal */
  const isFinalStatus = ["rejected", "refunded"].includes(returnData.status);

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h2 className={styles.title}>
              Return — {order?.orderNumber ?? returnData.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className={styles.subtitle}>
              {new Date(returnData.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status pill + edit button */}
        <div className={styles.headerRight}>
          <span
            className={`${styles.statusBadgeLarge} ${getStatusClass(returnData.status, styles)}`}
          >
            {formatStatus(returnData.status)}
          </span>

          {!isFinalStatus && (
            <button className={styles.editStatusBtn} onClick={openStatusModal}>
              <FiEdit2 size={14} />
              Edit Status
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className={styles.content}>

        {/* LEFT */}
        <div className={styles.left}>

          {/* RETURN ITEMS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiPackage size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Returned Items
            </h3>

            <div className={styles.items}>
              {returnItems.map((ri) => {
                const product   = ri.orderItem?.product;
                const variation = ri.orderItem?.productVariation;
                const image     = product?.images?.[0]?.url;
                const lineTotal = Number(ri.orderItem?.discountedPrice) * ri.quantity;
                return (
                  <div key={ri.id} className={styles.item}>
                    <img
                      src={image}
                      alt={product?.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.background = "#f3f4f6";
                      }}
                    />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{product?.name}</p>
                      {variation && (
                        <p className={styles.itemSku}>
                          Variant: {variation.variationName} &bull; SKU: {variation.sku}
                        </p>
                      )}
                      <p className={styles.itemPrice}>
                        QAR {ri.orderItem?.discountedPrice} × {ri.quantity}
                      </p>
                      {ri.reason && (
                        <p className={styles.itemReason}>
                          Reason: <em>{ri.reason}</em>
                        </p>
                      )}
                    </div>
                    <div className={styles.itemTotal}>
                      QAR {lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Refund Amount</span>
                <span>QAR {refundAmount.toFixed(2)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.feeRow}`}>
                <span>Return Fee</span>
                <span>− QAR {returnFee.toFixed(2)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Net Refund</span>
                <span>QAR {netRefund.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* RETURN INFO */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Return Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Return Type</label>
                <p style={{ textTransform: "capitalize" }}>{returnData.returnType}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Reason</label>
                <p>{returnData.reason}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Refund Method</label>
                <p style={{ textTransform: "capitalize" }}>
                  {returnData.refundMethod?.replace(/_/g, " ")}
                </p>
              </div>
              {returnData.returnPaymentMethod && (
                <div className={styles.infoItem}>
                  <label>Return Payment Method</label>
                  <p style={{ textTransform: "capitalize" }}>
                    {returnData.returnPaymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
              )}
              {returnData.adminNotes && (
                <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                  <label>Admin Notes</label>
                  <p>{returnData.adminNotes}</p>
                </div>
              )}
            </div>

            <div className={styles.address}>
              <label>Shipping Address</label>
              <p>{order?.shippingAddress?.address}</p>
              <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state}</p>
              {order?.shippingAddress?.landmark && (
                <p>Landmark: {order.shippingAddress.landmark}</p>
              )}
              <p>{order?.shippingAddress?.postalCode}</p>
              <p>{order?.shippingAddress?.country}</p>
            </div>
          </div>

          {/* ORDER REFERENCE */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Order Reference</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Order Number</label>
                <p>
                  <button
                    className={styles.orderLink}
                    onClick={() => navigate(`/orders/${returnData.orderId}`)}
                  >
                    {order?.orderNumber}
                  </button>
                </p>
              </div>
              <div className={styles.infoItem}>
                <label>Order Total</label>
                <p>QAR {order?.totalAmount}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Created At</label>
                <p>{new Date(returnData.createdAt).toLocaleString()}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Last Updated</label>
                <p>{new Date(returnData.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>

          {/* CUSTOMER INFORMATION */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Customer Information</h3>
            <div className={styles.customerInfo}>
              <div className={styles.customerAvatar}>
                <FiUser size={22} />
              </div>
              <div className={styles.customerDetails}>
                <strong>{customerProfile?.name ?? order?.shippingAddress?.name}</strong>
                <p>{customerProfile?.user?.email ?? "—"}</p>
                <p>{customerProfile?.phone ?? order?.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>

          {/* DELIVERY PARTNER */}
          <div className={styles.card}>
            <div className={styles.dpCardHeader}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Delivery Partner</h3>
            </div>

            {deliveryPartner ? (
              <div className={styles.dpInfo}>
                <div className={styles.dpAvatar}><FiUser size={22} /></div>
                <div className={styles.dpDetails}>
                  <strong className={styles.dpName}>
                    {deliveryPartner.AdminProfile?.name ?? "—"}
                  </strong>
                  <p className={styles.dpEmail}>{deliveryPartner.email}</p>
                  {deliveryPartner.AdminProfile?.phone && (
                    <p className={styles.dpPhone}>{deliveryPartner.AdminProfile.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.dpEmpty}>
                <FiUser size={32} className={styles.dpEmptyIcon} />
                <p>No delivery partner assigned</p>
              </div>
            )}
          </div>

          {/* RETURN STATUS CARD */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Return Status</h3>
            <div className={styles.statusInfo}>
              <span
                className={`${styles.statusBadgeLarge} ${getStatusClass(returnData.status, styles)}`}
              >
                {formatStatus(returnData.status)}
              </span>
              <div className={styles.statusMeta}>
                <p>Return ID: <code>{returnData.id.slice(0, 8).toUpperCase()}…</code></p>
                <p>Items in Return: <strong>{returnItems.length}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATUS CHANGE MODAL ===== */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update Return Status</h3>
              <button className={styles.modalClose} onClick={() => setShowStatusModal(false)}>
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalHint}>
                Current status:{" "}
                <span className={`${styles.statusBadgeSmall} ${getStatusClass(returnData.status, styles)}`}>
                  {formatStatus(returnData.status)}
                </span>
              </p>

              <div className={styles.statusOptionsList}>
                {RETURN_STATUSES.filter((s) => s.value !== returnData.status).map((s) => (
                  <div
                    key={s.value}
                    className={`${styles.statusOption} ${
                      selectedStatus === s.value ? styles.statusOptionSelected : ""
                    }`}
                    onClick={() => setSelectedStatus(s.value)}
                  >
                    <span className={`${styles.statusBadgeSmall} ${getStatusClass(s.value, styles)}`}>
                      {s.label}
                    </span>
                    {selectedStatus === s.value && (
                      <FiCheck size={16} className={styles.statusOptionCheck} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowStatusModal(false)}
                disabled={statusLoading}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleStatusUpdate}
                disabled={statusLoading || !selectedStatus || selectedStatus === returnData.status}
              >
                {statusLoading ? "Updating…" : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              ) : deliveryPartners.length === 0 ? (
                <p className={styles.modalEmpty}>No delivery partners available.</p>
              ) : (
                <div className={styles.partnerList}>
                  {deliveryPartners.map((partner) => {
                    const isSelected = selectedPartnerId === partner.id;
                    const isCurrent  = deliveryPartner?.id === partner.id;
                    return (
                      <div
                        key={partner.id}
                        className={`${styles.partnerItem} ${isSelected ? styles.partnerItemSelected : ""}`}
                        onClick={() => setSelectedPartnerId(partner.id)}
                      >
                        <div className={styles.partnerAvatar}><FiUser size={18} /></div>
                        <div className={styles.partnerItemDetails}>
                          <span className={styles.partnerName}>
                            {partner.AdminProfile?.name ?? "Unnamed"}
                            {isCurrent && <span className={styles.currentBadge}>Current</span>}
                          </span>
                          <span className={styles.partnerEmail}>{partner.email}</span>
                          {partner.AdminProfile?.phone && (
                            <span className={styles.partnerPhone}>{partner.AdminProfile.phone}</span>
                          )}
                        </div>
                        {isSelected && <FiCheck size={18} className={styles.partnerCheck} />}
                      </div>
                    );
                  })}
                </div>
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
    </div>
  );
}