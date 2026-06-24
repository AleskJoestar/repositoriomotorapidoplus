import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import {
  SaleDto,
  SaleItemDto,
  SaleFilters,
  SaleReportRow,
  AddCartItemRequest,
  CheckoutRequest,
  PaymentMethod,
} from '@/types/sale';

const prisma = new PrismaClient();

const saleInclude = {
  items: {
    include: {
      part: { select: { id: true, code: true, name: true, price: true, status: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

const saleReportInclude = {
  items: {
    include: {
      part: { select: { code: true, name: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  user: {
    include: {
      employee: { select: { name: true } },
    },
  },
};

export const resolveSellerName = (user: {
  id: number;
  email: string;
  employee?: { name: string } | null;
}): string => user.employee?.name || user.email.split('@')[0];

const parseTimeToMinutes = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const getMinutesOfDay = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

const formatItemsSummary = (
  items: Array<{ quantity: number; part: { code: string; name: string } }>
): string =>
  items
    .map((item) => `${item.part.code} ${item.part.name} x${item.quantity}`)
    .join('; ');

type SaleWithItems = {
  id: number;
  userId: number;
  status: string;
  paymentMethod: string | null;
  amountPaid: number | null;
  changeAmount: number | null;
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    id: number;
    partId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    part: { id: number; code: string; name: string; price: number; status: string };
  }>;
};

const formatSaleItem = (item: SaleWithItems['items'][0]): SaleItemDto => ({
  id: item.id,
  partId: item.partId,
  partCode: item.part.code,
  partName: item.part.name,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  totalPrice: item.totalPrice,
});

const formatSale = (sale: SaleWithItems): SaleDto => ({
  id: sale.id,
  status: sale.status,
  paymentMethod: sale.paymentMethod,
  amountPaid: sale.amountPaid,
  changeAmount: sale.changeAmount,
  totalAmount: sale.totalAmount,
  items: sale.items.map(formatSaleItem),
  createdAt: sale.createdAt,
});

const recalculateSaleTotal = async (saleId: number): Promise<number> => {
  const items = await prisma.saleItem.findMany({ where: { saleId } });
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  await prisma.sale.update({
    where: { id: saleId },
    data: { totalAmount: total },
  });
  return total;
};

export const verifyMasterCredentials = async (
  email: string,
  senha: string
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || user.status !== 'Ativo' || user.accessType !== 'MASTER') {
    return false;
  }

  return bcrypt.compare(senha, user.password);
};

const getOpenSale = async (userId: number): Promise<SaleWithItems | null> => {
  return prisma.sale.findFirst({
    where: { userId, status: 'ABERTA' },
    include: saleInclude,
  });
};

export const getCurrentSale = async (userId: number): Promise<SaleDto | null> => {
  const sale = await getOpenSale(userId);
  return sale ? formatSale(sale) : null;
};

const getOrCreateOpenSale = async (userId: number): Promise<SaleWithItems> => {
  const existing = await getOpenSale(userId);
  if (existing) return existing;

  const created = await prisma.sale.create({
    data: { userId, status: 'ABERTA', totalAmount: 0 },
    include: saleInclude,
  });
  return created;
};

export const addCartItem = async (
  userId: number,
  data: AddCartItemRequest
): Promise<SaleDto> => {
  const sale = await getOrCreateOpenSale(userId);

  const duplicate = sale.items.find((item) => item.partId === data.partId);
  if (duplicate) {
    const error = new Error('Produto já está no carrinho');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const part = await prisma.part.findUnique({ where: { id: data.partId } });
  if (!part || part.status !== 'Ativo') {
    const error = new Error('Produto não encontrado ou inativo');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (part.quantity < data.quantity) {
    const error = new Error('Estoque insuficiente para este produto');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const unitPrice = part.price;
  const totalPrice = unitPrice * data.quantity;

  await prisma.$transaction(async (tx) => {
    await tx.part.update({
      where: { id: part.id },
      data: { quantity: { decrement: data.quantity } },
    });

    await tx.stockMovement.create({
      data: {
        partId: part.id,
        type: 'VENDA_SAIDA',
        quantity: data.quantity,
      },
    });

    await tx.saleItem.create({
      data: {
        saleId: sale.id,
        partId: part.id,
        quantity: data.quantity,
        unitPrice,
        totalPrice,
      },
    });
  });

  await recalculateSaleTotal(sale.id);
  const updated = await prisma.sale.findUnique({
    where: { id: sale.id },
    include: saleInclude,
  });

  return formatSale(updated!);
};

export const removeCartItem = async (
  userId: number,
  partId: number,
  requesterAccessType: string,
  masterCredentials?: { email: string; senha: string }
): Promise<SaleDto> => {
  if (requesterAccessType !== 'MASTER') {
    if (!masterCredentials?.email || !masterCredentials?.senha) {
      const error = new Error('Autorização master necessária para remover item');
      (error as Error & { statusCode?: number }).statusCode = 403;
      throw error;
    }

    const isMaster = await verifyMasterCredentials(
      masterCredentials.email,
      masterCredentials.senha
    );
    if (!isMaster) {
      const error = new Error('Credenciais master inválidas');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }
  }

  const sale = await getOpenSale(userId);
  if (!sale) {
    const error = new Error('Nenhuma venda aberta encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const item = sale.items.find((i) => i.partId === partId);
  if (!item) {
    const error = new Error('Item não encontrado no carrinho');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    await tx.part.update({
      where: { id: partId },
      data: { quantity: { increment: item.quantity } },
    });

    await tx.stockMovement.create({
      data: {
        partId,
        type: 'VENDA_ESTORNO',
        quantity: item.quantity,
      },
    });

    await tx.saleItem.delete({ where: { id: item.id } });
  });

  await recalculateSaleTotal(sale.id);
  const updated = await prisma.sale.findUnique({
    where: { id: sale.id },
    include: saleInclude,
  });

  return formatSale(updated!);
};

export const checkoutSale = async (
  userId: number,
  data: CheckoutRequest
): Promise<SaleDto> => {
  const sale = await getOpenSale(userId);
  if (!sale) {
    const error = new Error('Nenhuma venda aberta encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (sale.items.length === 0) {
    const error = new Error('Carrinho vazio — adicione produtos antes de finalizar');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const total = sale.totalAmount;
  let amountPaid: number | null = null;
  let changeAmount: number | null = null;

  if (data.paymentMethod === 'DINHEIRO') {
    amountPaid = data.amountPaid ?? 0;
    if (amountPaid < total) {
      const error = new Error('Valor pago é menor que o total da venda');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
    changeAmount = amountPaid - total;
  }

  const finalized = await prisma.sale.update({
    where: { id: sale.id },
    data: {
      status: 'FINALIZADA',
      paymentMethod: data.paymentMethod as PaymentMethod,
      amountPaid,
      changeAmount,
      totalAmount: total,
    },
    include: saleInclude,
  });

  return formatSale(finalized);
};

export const getSalesReport = async (
  filters?: SaleFilters
): Promise<SaleReportRow[]> => {
  const where: Record<string, unknown> = { status: 'FINALIZADA' };

  if (filters?.dateFrom || filters?.dateTo) {
    const updatedAt: Record<string, Date> = {};
    if (filters.dateFrom) {
      const start = new Date(filters.dateFrom);
      start.setHours(0, 0, 0, 0);
      updatedAt.gte = start;
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      updatedAt.lte = end;
    }
    where.updatedAt = updatedAt;
  }

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: saleReportInclude,
  });

  const timeFromMinutes = filters?.timeFrom
    ? parseTimeToMinutes(filters.timeFrom)
    : null;
  const timeToMinutes = filters?.timeTo
    ? parseTimeToMinutes(filters.timeTo)
    : null;

  return sales
    .filter((sale) => {
      if (timeFromMinutes === null && timeToMinutes === null) return true;
      const minutes = getMinutesOfDay(sale.updatedAt);
      if (timeFromMinutes !== null && minutes < timeFromMinutes) return false;
      if (timeToMinutes !== null && minutes > timeToMinutes) return false;
      return true;
    })
    .map((sale) => ({
      id: sale.id,
      userId: sale.userId,
      sellerName: resolveSellerName(sale.user),
      itemsSummary: formatItemsSummary(sale.items),
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod ?? '-',
      soldAt: sale.updatedAt,
      items: sale.items.map((item) => ({
        id: item.id,
        partId: item.partId,
        partCode: item.part.code,
        partName: item.part.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }));
};
