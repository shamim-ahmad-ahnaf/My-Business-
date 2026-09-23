import QRCode from 'qrcode';
import { SaleRecord, BusinessProfile } from '../types';

export interface InvoiceQrPayload {
  type: 'kachamal_invoice';
  version: '1.0';
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  itemCount: number;
  shopName: string;
  shopPhone: string;
}

/**
 * Creates a JSON payload representing the invoice for QR encoding.
 */
export function createInvoiceQrPayload(sale: SaleRecord, profile: BusinessProfile): InvoiceQrPayload {
  return {
    type: 'kachamal_invoice',
    version: '1.0',
    invoiceNo: sale.invoiceNo,
    date: sale.date,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone || '',
    grandTotal: sale.grandTotal,
    paidAmount: sale.paidAmount,
    dueAmount: sale.dueAmount,
    paymentMethod: sale.paymentMethod,
    itemCount: sale.items?.length || 0,
    shopName: profile.businessName,
    shopPhone: profile.phone
  };
}

/**
 * Generates high quality Data URL (base64 image) of QR Code.
 */
export async function generateQrDataUrl(
  content: string, 
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string }
): Promise<string> {
  try {
    const opts = {
      width: options?.width || 256,
      margin: options?.margin !== undefined ? options?.margin : 1,
      color: {
        dark: options?.darkColor || '#0c0a09', // stone-950
        light: options?.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'M' as const
    };
    return await QRCode.toDataURL(content, opts);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    throw err;
  }
}

/**
 * Parses scanned QR text into an identified invoice number or payload.
 */
export function parseScannedQr(text: string): {
  isValidInvoice: boolean;
  invoiceNo: string;
  payload: Partial<InvoiceQrPayload> | null;
  rawText: string;
} {
  const trimmed = text.trim();

  // Try parsing JSON first
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.invoiceNo || parsed.type === 'kachamal_invoice') {
        return {
          isValidInvoice: true,
          invoiceNo: parsed.invoiceNo || '',
          payload: parsed,
          rawText: trimmed
        };
      }
    }
  } catch {
    // Not valid JSON, proceed to pattern checks
  }

  // Check URL with invoice query or path (e.g. ?invoice=MEMO-123 or /invoice/MEMO-123)
  if (trimmed.includes('invoice=')) {
    const match = trimmed.match(/invoice=([A-Za-z0-9-_]+)/);
    if (match && match[1]) {
      return {
        isValidInvoice: true,
        invoiceNo: match[1],
        payload: null,
        rawText: trimmed
      };
    }
  }

  // Check direct pattern like MEMO-XXXX or INV-XXXX
  if (/^(MEMO|INV|BILL|CHALAN)-[A-Za-z0-9-_]+/i.test(trimmed)) {
    return {
      isValidInvoice: true,
      invoiceNo: trimmed,
      payload: null,
      rawText: trimmed
    };
  }

  // Fallback: Return raw string
  return {
    isValidInvoice: false,
    invoiceNo: trimmed,
    payload: null,
    rawText: trimmed
  };
}
