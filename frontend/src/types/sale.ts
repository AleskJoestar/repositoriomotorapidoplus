export const LOW_STOCK_THRESHOLD = 5;

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'DINHEIRO',
  'DEBITO',
  'CREDITO',
];

export interface SaleItem {
  id: number;
  partId: number;
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: number;
  status: string;
  paymentMethod?: string | null;
  amountPaid?: number | null;
  changeAmount?: number | null;
  totalAmount: number;
  items: SaleItem[];
  createdAt: string;
}

export interface CheckoutRequest {
  paymentMethod: PaymentMethod;
  amountPaid?: number;
}

export const formatCurrency = (value?: number | null): string =>
  (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
}

export interface SaleReportRow {
  id: number;
  userId: number;
  sellerName: string;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: string;
  soldAt: string;
  items: SaleItem[];
}

export const formatSaleDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
