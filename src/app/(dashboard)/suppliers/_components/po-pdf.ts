import { jsPDF } from "jspdf";
import { type PO } from "../page";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const poTotal = (po: PO) => po.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0);

export function generatePOPdf(po: PO) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  let y = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE ORDER", marginX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(po.id, pageWidth - marginX, y, { align: "right" });

  y += 10;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // Info grid
  const infoLeft: [string, string][] = [
    ["Supplier", po.supplierName],
    ["Tanggal PO", po.date],
  ];
  const infoRight: [string, string][] = [
    ["Tanggal Tiba", po.arrivalDate],
    ["Status", po.status],
  ];

  doc.setFontSize(9);
  infoLeft.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginX, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value, marginX + 35, y + i * 7);
  });
  infoRight.forEach(([label, value], i) => {
    const x = pageWidth / 2 + 10;
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value, x + 35, y + i * 7);
  });

  y += infoLeft.length * 7 + 4;

  if (po.createdBy) {
    doc.setFont("helvetica", "bold");
    doc.text("Dibuat Oleh", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(po.createdBy, marginX + 35, y);
    y += 7;
  }

  if (po.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Catatan", marginX, y);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(po.notes, pageWidth - marginX * 2 - 35);
    doc.text(noteLines, marginX + 35, y);
    y += noteLines.length * 5 + 4;
  }

  y += 6;

  // Table header
  const colX = {
    bean: marginX,
    qty: marginX + 80,
    price: marginX + 115,
    subtotal: pageWidth - marginX,
  };

  doc.setFillColor(240, 240, 240);
  doc.rect(marginX, y - 5, pageWidth - marginX * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Biji Kopi", colX.bean + 2, y);
  doc.text("Qty", colX.qty, y, { align: "right" });
  doc.text("Harga/kg", colX.price, y, { align: "right" });
  doc.text("Subtotal", colX.subtotal, y, { align: "right" });
  y += 8;

  // Table rows
  doc.setFont("helvetica", "normal");
  po.items.forEach((item) => {
    doc.text(item.bean, colX.bean + 2, y);
    doc.text(`${item.qty} kg`, colX.qty, y, { align: "right" });
    doc.text(fmt(item.pricePerKg), colX.price, y, { align: "right" });
    doc.text(fmt(item.qty * item.pricePerKg), colX.subtotal, y, { align: "right" });
    y += 7;
    doc.setDrawColor(230);
    doc.line(marginX, y - 4, pageWidth - marginX, y - 4);
  });

  // Total
  y += 2;
  doc.setDrawColor(0);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Keseluruhan", colX.price, y, { align: "right" });
  doc.text(fmt(poTotal(po)), colX.subtotal, y, { align: "right" });

  // Footer
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Dokumen dibuat otomatis pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    marginX,
    y,
  );

  doc.save(`${po.id}.pdf`);
}
/* ─── Fungsi untuk menghasilkan Blob PDF (digunakan oleh success modal) ─── */
export async function getPOPdfBlob(po: PO): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  let y = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE ORDER", marginX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(po.id, pageWidth - marginX, y, { align: "right" });

  y += 10;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const infoLeft: [string, string][] = [
    ["Supplier", po.supplierName],
    ["Tanggal PO", po.date],
  ];
  const infoRight: [string, string][] = [
    ["Tanggal Tiba", po.arrivalDate],
    ["Status", po.status],
  ];

  doc.setFontSize(9);
  infoLeft.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginX, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value, marginX + 35, y + i * 7);
  });
  infoRight.forEach(([label, value], i) => {
    const x = pageWidth / 2 + 10;
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value, x + 35, y + i * 7);
  });

  y += infoLeft.length * 7 + 4;

  if (po.createdBy) {
    doc.setFont("helvetica", "bold");
    doc.text("Dibuat Oleh", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(po.createdBy, marginX + 35, y);
    y += 7;
  }

  if (po.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Catatan", marginX, y);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(po.notes, pageWidth - marginX * 2 - 35);
    doc.text(noteLines, marginX + 35, y);
    y += noteLines.length * 5 + 4;
  }

  y += 6;

  const colX = {
    bean: marginX,
    qty: marginX + 80,
    price: marginX + 115,
    subtotal: pageWidth - marginX,
  };

  doc.setFillColor(240, 240, 240);
  doc.rect(marginX, y - 5, pageWidth - marginX * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Biji Kopi", colX.bean + 2, y);
  doc.text("Qty", colX.qty, y, { align: "right" });
  doc.text("Harga/kg", colX.price, y, { align: "right" });
  doc.text("Subtotal", colX.subtotal, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  po.items.forEach((item) => {
    doc.text(item.bean, colX.bean + 2, y);
    doc.text(`${item.qty} kg`, colX.qty, y, { align: "right" });
    doc.text(fmt(item.pricePerKg), colX.price, y, { align: "right" });
    doc.text(fmt(item.qty * item.pricePerKg), colX.subtotal, y, { align: "right" });
    y += 7;
    doc.setDrawColor(230);
    doc.line(marginX, y - 4, pageWidth - marginX, y - 4);
  });

  y += 2;
  doc.setDrawColor(0);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Keseluruhan", colX.price, y, { align: "right" });
  doc.text(fmt(poTotal(po)), colX.subtotal, y, { align: "right" });

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Dokumen dibuat otomatis pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    marginX,
    y,
  );

  return doc.output("blob");
}
