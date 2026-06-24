export const LOW_STOCK_THRESHOLD = 5;

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'DINHEIRO',
  'DEBITO',
  'CREDITO',
];

export interface SaleItemDto {
  id: number;
  partId: number;
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleDto {
  id: number;
  status: string;
  paymentMethod?: string | null;
  amountPaid?: number | null;
  changeAmount?: number | null;
  totalAmount: number;
  items: SaleItemDto[];
  createdAt: Date;
}

export interface AddCartItemRequest {
  partId: number;
  quantity: number;
}

export interface RemoveCartItemRequest {
  masterEmail?: string;
  masterSenha?: string;
}

export interface CheckoutRequest {
  paymentMethod: PaymentMethod;
  amountPaid?: number;
}

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
  soldAt: Date;
  items: SaleItemDto[];
}
