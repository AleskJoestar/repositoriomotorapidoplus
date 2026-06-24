import { PrismaClient } from '@prisma/client';
import {
  Part,
  CreatePartRequest,
  UpdatePartRequest,
  PartFilters,
  PartAuditLog,
} from '@/types';
import { LOW_STOCK_THRESHOLD } from '@/types/sale';

const prisma = new PrismaClient();

const partInclude = {
  category: { select: { name: true } },
  manufacturer: { select: { name: true } },
} as const;

type PartWithRelations = {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  manufacturerId: number;
  quantity: number;
  description: string | null;
  serialNumber: string | null;
  location: string | null;
  minQuantity: number;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
  category?: { name: string };
  manufacturer?: { name: string };
};

const formatPart = (part: PartWithRelations): Part => ({
  id: part.id,
  code: part.code,
  name: part.name,
  categoryId: part.categoryId,
  categoryName: part.category?.name ?? '',
  manufacturerId: part.manufacturerId,
  manufacturerName: part.manufacturer?.name ?? '',
  quantity: part.quantity,
  description: part.description,
  serialNumber: part.serialNumber,
  location: part.location,
  minQuantity: part.minQuantity,
  price: Number(part.price ?? 0),
  status: part.status as Part['status'],
  createdAt: part.createdAt,
  updatedAt: part.updatedAt,
  inactivatedAt: part.inactivatedAt,
});

const generatePartCode = async (): Promise<string> => {
  const lastPart = await prisma.part.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });
  const nextId = (lastPart?.id ?? 0) + 1;
  return `P-${String(nextId).padStart(6, '0')}`;
};

const createPartAuditLog = async (
  partId: number,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  changedFields: Record<string, unknown>,
  userId: string
): Promise<void> => {
  try {
    await prisma.partAuditLog.create({
      data: {
        partId,
        action,
        changedFields: JSON.stringify(changedFields),
        userId,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria de peça:', error);
  }
};

const validateCategoryAndManufacturer = async (
  categoryId: number,
  manufacturerId: number
): Promise<void> => {
  const [category, manufacturer] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId } }),
    prisma.manufacturer.findUnique({ where: { id: manufacturerId } }),
  ]);

  if (!category) {
    const error = new Error('Categoria não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (category.status !== 'Ativo') {
    const error = new Error('Categoria inativa não pode ser vinculada');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (!manufacturer) {
    const error = new Error('Fabricante não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (manufacturer.status !== 'Ativo') {
    const error = new Error('Fabricante inativo não pode ser vinculado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }
};

const checkDuplicateNameManufacturer = async (
  name: string,
  manufacturerId: number,
  excludeId?: number
): Promise<boolean> => {
  const normalizedName = name.trim().toLowerCase();

  const parts = await prisma.part.findMany({
    where: {
      manufacturerId,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, name: true },
  });

  return parts.some(
    (part) => part.name.trim().toLowerCase() === normalizedName
  );
};

export const createPart = async (
  data: CreatePartRequest,
  userId: string
): Promise<Part> => {
  await validateCategoryAndManufacturer(data.categoryId, data.manufacturerId);

  const isDuplicate = await checkDuplicateNameManufacturer(
    data.name,
    data.manufacturerId
  );

  if (isDuplicate) {
    const error = new Error(
      'Já existe uma peça com a mesma combinação de Nome e Fabricante'
    );
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const code = await generatePartCode();

  const part = await prisma.part.create({
    data: {
      code,
      name: data.name.trim(),
      categoryId: data.categoryId,
      manufacturerId: data.manufacturerId,
      quantity: data.quantity,
      description: data.description?.trim() || null,
      serialNumber: data.serialNumber?.trim() || null,
      location: data.location?.trim() || null,
      minQuantity: data.minQuantity,
      price: data.price ?? 0,
      status: 'Ativo',
    },
    include: partInclude,
  });

  await createPartAuditLog(
    part.id,
    'CREATE',
    { ...data, code: part.code },
    userId
  );

  return formatPart(part);
};

export const getAllParts = async (filters?: PartFilters): Promise<Part[]> => {
  const where: Record<string, unknown> = {};

  if (filters?.status === undefined || filters?.status === '') {
    where.status = 'Ativo';
  } else if (filters?.status !== 'todos') {
    where.status = filters.status;
  }

  if (filters?.category?.trim()) {
    where.category = { name: { contains: filters.category.trim() } };
  }

  if (filters?.manufacturer?.trim()) {
    where.manufacturer = { name: { contains: filters.manufacturer.trim() } };
  }

  const parts = await prisma.part.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: partInclude,
  });

  if (filters?.lowStock === 'true') {
    return parts
      .filter((part) => part.quantity <= LOW_STOCK_THRESHOLD)
      .map(formatPart);
  }

  return parts.map(formatPart);
};

export const getPartById = async (id: string): Promise<Part | null> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  const part = await prisma.part.findUnique({
    where: { id: numericId },
    include: partInclude,
  });
  return part ? formatPart(part) : null;
};

export const updatePart = async (
  id: string,
  data: UpdatePartRequest,
  userId: string
): Promise<Part> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) {
    const error = new Error('ID de peça inválido');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const existing = await prisma.part.findUnique({ where: { id: numericId } });
  if (!existing) {
    const error = new Error('Peça não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const nextCategoryId = data.categoryId ?? existing.categoryId;
  const nextManufacturerId = data.manufacturerId ?? existing.manufacturerId;

  if (data.categoryId !== undefined || data.manufacturerId !== undefined) {
    await validateCategoryAndManufacturer(nextCategoryId, nextManufacturerId);
  }

  const nextName = data.name ?? existing.name;

  const isDuplicate = await checkDuplicateNameManufacturer(
    nextName,
    nextManufacturerId,
    numericId
  );

  if (isDuplicate) {
    const error = new Error(
      'Já existe uma peça com a mesma combinação de Nome e Fabricante'
    );
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const updateData: Record<string, unknown> = {};
  const changedFields: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        updateData[key] = trimmed || null;
        changedFields[key] = trimmed || null;
      } else {
        updateData[key] = value;
        changedFields[key] = value;
      }
    }
  });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.part.update({
      where: { id: numericId },
      data: updateData,
      include: partInclude,
    });

    if (data.quantity !== undefined && data.quantity !== existing.quantity) {
      const diff = data.quantity - existing.quantity;
      if (diff !== 0) {
        await tx.stockMovement.create({
          data: {
            partId: numericId,
            type: diff > 0 ? 'ENTRADA' : 'SAIDA',
            quantity: Math.abs(diff),
          },
        });
      }
    }

    return result;
  });

  if (Object.keys(changedFields).length > 0) {
    await createPartAuditLog(numericId, 'UPDATE', changedFields, userId);
  }

  return formatPart(updated);
};

export const deletePart = async (
  id: string,
  userId: string
): Promise<{ part: Part; message: string }> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) {
    const error = new Error('ID de peça inválido');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const existing = await prisma.part.findUnique({
    where: { id: numericId },
    include: partInclude,
  });
  if (!existing) {
    const error = new Error('Peça não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (existing.status === 'Inativo') {
    return {
      part: formatPart(existing),
      message: 'Peça já está inativa',
    };
  }

  const inactivated = await prisma.part.update({
    where: { id: numericId },
    data: {
      status: 'Inativo',
      inactivatedAt: new Date(),
    },
    include: partInclude,
  });

  await createPartAuditLog(
    numericId,
    'DELETE',
    {
      status: 'Inativo',
      inactivatedAt: new Date().toISOString(),
      reason: 'Exclusão lógica — peça inativada',
    },
    userId
  );

  return {
    part: formatPart(inactivated),
    message: 'Peça inativada com sucesso',
  };
};

export const reactivatePart = async (
  id: string,
  userId: string
): Promise<Part> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) {
    const error = new Error('ID de peça inválido');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const existing = await prisma.part.findUnique({
    where: { id: numericId },
    include: partInclude,
  });
  if (!existing) {
    const error = new Error('Peça não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (existing.status === 'Ativo') {
    return formatPart(existing);
  }

  const reactivated = await prisma.part.update({
    where: { id: numericId },
    data: { status: 'Ativo', inactivatedAt: null },
    include: partInclude,
  });

  await createPartAuditLog(
    numericId,
    'UPDATE',
    { status: 'Ativo', inactivatedAt: null, reason: 'Reativação' },
    userId
  );

  return formatPart(reactivated);
};

export const getPartAuditLogs = async (
  id: string
): Promise<PartAuditLog[]> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) {
    const error = new Error('ID de peça inválido');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const part = await prisma.part.findUnique({ where: { id: numericId } });
  if (!part) {
    const error = new Error('Peça não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const logs = await prisma.partAuditLog.findMany({
    where: { partId: numericId },
    orderBy: { createdAt: 'desc' },
  });

  const userIds = [
    ...new Set(
      logs
        .map((log) => parseInt(log.userId, 10))
        .filter((uid) => !Number.isNaN(uid))
    ),
  ];

  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];

  const userMap = new Map(users.map((user) => [String(user.id), user.email]));

  return logs.map((log) => ({
    id: log.id,
    partId: log.partId,
    action: log.action as PartAuditLog['action'],
    changedFields: JSON.parse(log.changedFields) as Record<string, unknown>,
    userId: log.userId,
    userName: userMap.get(log.userId) || 'Usuário desconhecido',
    createdAt: log.createdAt,
  }));
};

export { getAllParts as getPartsForReport };
