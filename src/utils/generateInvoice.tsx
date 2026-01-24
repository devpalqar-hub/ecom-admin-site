import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImageAsBase64 } from "./loadImage";
import { ar } from "./arabicText";

const labels = {
  en: {
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
  },
  ar: {
    invoice: "فاتورة",
    billing: "تفاصيل الفاتورة",
    product: "المنتج",
    price: "السعر",
    qty: "الكمية",
    total: "الإجمالي",
    phone: "الهاتف",
    itemsTotal: "إجمالي المنتجات",
    subtotal: "الإجمالي بعد الخصم",
    shipping: "الشحن",
    tax: "الضريبة",
    totalPayable: "المبلغ الإجمالي",
    coupon: "قسيمة",
  },
};

export async function generateInvoice(
  order: any,
  lang: "en" | "ar" = "en"
) {
  const doc = new jsPDF();

  /* ================= FONT (Arabic optional) ================= */
  if (lang === "ar") {
    try {
      await import("@/utils/fonts/Amiri");
      doc.setFont("Amiri");
    } catch {
      console.warn("Arabic font not loaded, using default");
    }
  }

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
  const billingTitle =
    lang === "ar"
      ? ar(labels.ar.billing)
      : labels.en.billing;

  doc.text(
    billingTitle,
    lang === "ar" ? 190 : 14,
    46,
    { align: lang === "ar" ? "right" : "left" }
  );

  doc.setFontSize(10);
  const addr = order.shippingAddress || {};

  const billingLines = [
    addr.name,
    addr.address,
    `${addr.city || ""} ${addr.postalCode || ""}`,
    addr.country,
    `${labels[lang].phone}: ${addr.phone || "-"}`,
  ];

  billingLines.forEach((line: string, i: number) => {
    const text = lang === "ar" ? ar(line || "-") : line || "-";
    doc.text(
      text,
      lang === "ar" ? 190 : 14,
      54 + i * 6,
      { align: lang === "ar" ? "right" : "left" }
    );
  });

  /* ================= ITEMS TABLE ================= */
  autoTable(doc, {
    startY: 90,
    styles: {
      fontSize: 10,
      halign: lang === "ar" ? "right" : "left",
    },
    head: [[
      lang === "ar" ? ar(labels.ar.product) : labels.en.product,
      lang === "ar" ? ar(labels.ar.price) : labels.en.price,
      lang === "ar" ? ar(labels.ar.qty) : labels.en.qty,
      lang === "ar" ? ar(labels.ar.total) : labels.en.total,
    ]],
    body: order.items.map((item: any) => [
      lang === "ar"
        ? ar(item.product.name)
        : item.product.name,
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
  const rightX = lang === "ar" ? 190 : 140;
  const align = lang === "ar" ? "right" : "left";

  doc.setFontSize(10);

  const row = (label: string, value: string) => {
    doc.text(
      lang === "ar" ? ar(label) : label,
      rightX,
      y,
      { align }
    );
    doc.text(
      lang === "ar" ? ar(value) : value,
      rightX + (lang === "ar" ? -40 : 40),
      y,
      { align }
    );
    y += 6;
  };

  row(labels[lang].itemsTotal, `QAR ${itemsTotal.toFixed(2)}`);

  if (order.coupun) {
    row(
      `${labels[lang].coupon} (${order.coupun.couponName})`,
      `- QAR ${couponDiscount.toFixed(2)}`
    );
  }

  row(
    labels[lang].subtotal,
    `QAR ${subtotalAfterDiscount.toFixed(2)}`
  );

  row(
    labels[lang].shipping,
    `QAR ${shippingCost.toFixed(2)}`
  );

  row(
    labels[lang].tax,
    `QAR ${taxAmount.toFixed(2)}`
  );

  /* ================= FINAL TOTAL ================= */
  doc.setFontSize(12);
  doc.text(
    lang === "ar"
      ? ar(`${labels.ar.totalPayable}: QAR ${finalTotal.toFixed(2)}`)
      : `${labels.en.totalPayable}: QAR ${finalTotal.toFixed(2)}`,
    rightX,
    y + 8,
    { align }
  );

  /* ================= SAVE ================= */
  doc.save(`Invoice_${order.orderNumber}_${lang}.pdf`);
}
