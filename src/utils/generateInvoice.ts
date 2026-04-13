import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImageAsBase64 } from "./loadImage";

const labels = {
  invoice: "INVOICE",
  billing: "Billing Details",
  product: "Product",
  price: "Price",
  qty: "Qty",
  total: "Total",
  phone: "Phone",
  itemsTotal: "Items Total",
  subtotal: "Subtotal after discount",
  shipping: "Shipping",
  tax: "Tax",
  totalPayable: "Total Payable",
  coupon: "Coupon",
};

export async function generateInvoice(order: any) {
  const doc = new jsPDF();

  /* ================= LOGO ================= */
  try {
    const logo = await loadImageAsBase64(
      `${import.meta.env.BASE_URL}raheeb-logo.jpg`
    );
    doc.addImage(logo, "JPG", 14, 10, 40, 20);
  } catch {
    console.warn("Logo not found");
  }

  /* ================= BILLING ================= */
  doc.setFontSize(12);
  doc.text(labels.billing, 14, 46);

  doc.setFontSize(10);
  const addr = order.shippingAddress || {};

  const billingLines = [
    addr.name,
    addr.address,
    `${addr.city || ""} ${addr.postalCode || ""}`,
    addr.country,
    `${labels.phone}: ${addr.phone || "-"}`,
  ];

  billingLines.forEach((line: string, i: number) => {
    doc.text(line || "-", 14, 54 + i * 6);
  });

  /* ================= ITEMS TABLE ================= */
  autoTable(doc, {
    startY: 90,
    styles: {
      fontSize: 10,
      halign: "left",
    },
    head: [[
      labels.product,
      labels.price,
      labels.qty,
      labels.total,
    ]],
    body: order.items.map((item: any) => [
      item.product.name,
      `QAR ${item.product.discountedPrice}`,
      item.quantity,
      `QAR ${(
        Number(item.product.discountedPrice) * item.quantity
      ).toFixed(2)}`,
    ]),
  });

  /* ================= CALCULATIONS ================= */
  const itemsTotal = order.items.reduce(
    (sum: number, item: any) =>
      sum +
      Number(item.product.discountedPrice) * item.quantity,
    0
  );

  const couponDiscount = order.coupun
    ? Number(order.coupun.Value)
    : 0;

  const subtotalAfterDiscount =
    itemsTotal - couponDiscount;

  const shippingCost = Number(order.shippingCost || 0);
  const taxAmount = Number(order.taxAmount || 0);

  const finalTotal =
    subtotalAfterDiscount + shippingCost + taxAmount;

  /* ================= PRICING SUMMARY ================= */
  let y = (doc as any).lastAutoTable.finalY + 12;
  const rightX = 140;

  doc.setFontSize(10);

  const row = (label: string, value: string) => {
    doc.text(label, rightX, y);
    doc.text(value, rightX + 40, y);
    y += 6;
  };

  row(labels.itemsTotal, `QAR ${itemsTotal.toFixed(2)}`);

  if (order.coupun) {
    row(
      `${labels.coupon} (${order.coupun.couponName})`,
      `- QAR ${couponDiscount.toFixed(2)}`
    );
  }

  row(
    labels.subtotal,
    `QAR ${subtotalAfterDiscount.toFixed(2)}`
  );

  row(
    labels.shipping,
    `QAR ${shippingCost.toFixed(2)}`
  );

  row(
    labels.tax,
    `QAR ${taxAmount.toFixed(2)}`
  );

  /* ================= FINAL TOTAL ================= */
  doc.setFontSize(12);
  doc.text(
    `${labels.totalPayable}: QAR ${finalTotal.toFixed(2)}`,
    rightX,
    y + 8
  );

  /* ================= SAVE ================= */
  doc.save(`Invoice_${order.orderNumber}.pdf`);
}