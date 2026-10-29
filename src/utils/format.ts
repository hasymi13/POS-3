import * as XLSX from 'xlsx';
import { Transaction, Product } from '../types/pos';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatIndonesianDateTime = (dateString?: string | Date): string => {
  const d = dateString ? new Date(dateString) : new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
};

export const formatIndonesianDate = (dateString?: string | Date): string => {
  const d = dateString ? new Date(dateString) : new Date();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV/${y}${m}${d}/${rand}`;
};

// WhatsApp Link Generator for Low Stock Alert
export const generateWhatsAppStockAlertUrl = (
  phone: string,
  products: Product[],
  storeName: string
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  let message = `⚠️ *PERINGATAN STOK MENIPIS - ${storeName.toUpperCase()}*\n`;
  message += `Waktu: ${formatIndonesianDateTime()}\n\n`;
  message += `Halo Tim Pengadaan/Supplier, mohon segera restock produk-produk berikut:\n`;

  products.forEach((p, idx) => {
    message += `${idx + 1}. *${p.name}* (SKU: ${p.sku})\n`;
    message += `   - Sisa Stok: ${p.stock} ${p.unit} (Batas Min: ${p.minStock} ${p.unit})\n`;
    message += `   - Supplier: ${p.supplier}\n`;
  });

  message += `\nMohon konfirmasi pesanan restock ini. Terima kasih! 🙏`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

// WhatsApp Link Generator for Digital Customer Receipt
export const generateWhatsAppReceiptUrl = (
  phone: string,
  transaction: Transaction,
  storeName: string
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  let text = `🧾 *STRUK PEMBELIAN - ${storeName.toUpperCase()}*\n`;
  text += `No. Faktur: ${transaction.invoiceNumber}\n`;
  text += `Tanggal: ${formatIndonesianDateTime(transaction.date)}\n`;
  text += `Kasir: ${transaction.cashierName} | Unit: ${transaction.branchName}\n`;
  text += `--------------------------------\n`;

  transaction.items.forEach((item) => {
    text += `${item.productName}\n`;
    text += `${item.quantity} x ${formatRupiah(item.sellingPrice)} = ${formatRupiah(item.subtotal)}\n`;
  });

  text += `--------------------------------\n`;
  text += `Subtotal: ${formatRupiah(transaction.subtotal)}\n`;
  if (transaction.discountTotal > 0) {
    text += `Diskon: -${formatRupiah(transaction.discountTotal)}\n`;
  }
  if (transaction.tax > 0) {
    text += `PPN (11%): ${formatRupiah(transaction.tax)}\n`;
  }
  text += `*TOTAL BAYAR: ${formatRupiah(transaction.total)}*\n`;
  text += `Metode Pembayaran: ${transaction.payment.method.toUpperCase()} ${transaction.payment.provider ? `(${transaction.payment.provider})` : ''}\n`;
  if (transaction.payment.method === 'cash') {
    text += `Tunai: ${formatRupiah(transaction.payment.amountPaid)}\n`;
    text += `Kembali: ${formatRupiah(transaction.payment.change)}\n`;
  }
  text += `--------------------------------\n`;
  text += `Terima kasih telah berbelanja di ${storeName}!\nBarang yang sudah dibeli tidak dapat ditukar.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

// Export to formatted Excel workbook (.xlsx)
export const exportTransactionsToExcel = (
  transactions: Transaction[],
  storeName: string,
  dateRangeLabel: string
) => {
  // Sheet 1: Ringkasan Transaksi
  const summaryData = transactions.map((t, idx) => ({
    'No': idx + 1,
    'No Faktur': t.invoiceNumber,
    'Tanggal': formatIndonesianDateTime(t.date),
    'Cabang / Unit': t.branchName,
    'Kasir': t.cashierName,
    'Pelanggan': t.customerName || 'Umum',
    'Total Item': t.items.reduce((acc, it) => acc + it.quantity, 0),
    'Subtotal (Rp)': t.subtotal,
    'Diskon (Rp)': t.discountTotal,
    'PPN 11% (Rp)': t.tax,
    'Total Akhir (Rp)': t.total,
    'Total HPP (Rp)': t.totalCost,
    'Laba Kotor (Rp)': t.grossProfit,
    'Metode Pembayaran': t.payment.method.toUpperCase(),
    'Provider / Bank': t.payment.provider || '-',
    'Status': t.status.toUpperCase(),
  }));

  // Sheet 2: Detail Item Terjual
  const detailData: Record<string, unknown>[] = [];
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      detailData.push({
        'No Faktur': t.invoiceNumber,
        'Tanggal': formatIndonesianDate(t.date),
        'SKU': item.sku,
        'Nama Produk': item.productName,
        'Qty': item.quantity,
        'Harga Modal HPP (Rp)': item.costPrice,
        'Harga Jual (Rp)': item.sellingPrice,
        'Subtotal (Rp)': item.subtotal,
        'Laba Kotor (Rp)': (item.sellingPrice - item.costPrice) * item.quantity,
      });
    });
  });

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  const detailSheet = XLSX.utils.json_to_sheet(detailData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Penjualan');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Item Terjual');

  const fileName = `Laporan_Penjualan_${storeName.replace(/\s+/g, '_')}_${dateRangeLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Export Products Inventory to Excel
export const exportInventoryToExcel = (products: Product[], storeName: string) => {
  const data = products.map((p, idx) => ({
    'No': idx + 1,
    'SKU': p.sku,
    'Barcode': p.barcode,
    'Nama Produk': p.name,
    'Kategori': p.category,
    'Satuan': p.unit,
    'Harga Beli / HPP (Rp)': p.costPrice,
    'Harga Jual (Rp)': p.sellingPrice,
    'Margin Keuntungan (Rp)': p.sellingPrice - p.costPrice,
    'Stok Saat Ini': p.stock,
    'Batas Min Stok': p.minStock,
    'Status Stok': p.stock <= 0 ? 'HABIS' : p.stock <= p.minStock ? 'MENIPIS' : 'AMAN',
    'Total Nilai Stok (Rp)': p.stock * p.costPrice,
    'Supplier': p.supplier,
    'Terakhir Diperbarui': formatIndonesianDate(p.lastUpdated),
  }));

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Data Inventaris & Stok');

  const fileName = `Inventaris_Stok_${storeName.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
