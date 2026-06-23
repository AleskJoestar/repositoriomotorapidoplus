import { PrismaClient } from '@prisma/client';
import {
  Part,
  CreatePartRequest,
  UpdatePartRequest,
  PartFilters,
} from '@/types';

const prisma = new PrismaClient();

const formatPart = (part: {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  description: string | null;
  manufacturer: string | null;
  serialNumber: string | null;
  location: string | null;
  minQuantity: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
}): Part => ({
  ...part,
  status: part.status as Part['status'],
});

const generatePartCode = async (): Promise<string> => {
  const count = await prisma.part.count();
  return `P-${String(count + 1).padStart(6, '0')}`;
};

const normalizeManufacturer = (manufacturer?: string | null): string =>
  manufacturer?.trim() || '';

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

const checkDuplicateNameManufacturer = async (
  name: string,
  manufacturer?: string | null,
  excludeId?: number
): Promise<boolean> => {
  const normalizedName = name.trim().toLowerCase();
  const normalizedManufacturer = normalizeManufacturer(manufacturer).toLowerCase();

  const parts = await prisma.part.findMany({
    where: excludeId ? { NOT: { id: excludeId } } : undefined,
    select: { id: true, name: true, manufacturer: true },
  });

  return parts.some(
    (part) =>
      part.name.trim().toLowerCase() === normalizedName &&
      normalizeManufacturer(part.manufacturer).toLowerCase() === normalizedManufacturer
  );
};

export const createPart = async (
  data: CreatePartRequest,
  userId: string
): Promise<Part> => {
  const isDuplicate = await checkDuplicateNameManufacturer(
    data.name,
    data.manufacturer
  );

  if (isDuplicate) {
    const error = new Error(
      'Já existe uma peça com a mesma combinação de Nome e Fabricante'
    );
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const code = await generatePartCode();

  const part = await prisma.$transaction(async (tx) => {
    const created = await tx.part.create({
      data: {
        code,
        name: data.name.trim(),
        category: data.category.trim(),
        quantity: data.quantity,
        description: data.description?.trim() || null,
        manufacturer: data.manufacturer?.trim() || null,
        serialNumber: data.serialNumber?.trim() || null,
        location: data.location?.trim() || null,
        minQuantity: data.minQuantity ?? null,
        status: 'Ativo',
      },
    });

    await tx.stockMovement.create({
      data: {
        partId: created.id,
        type: 'ENTRADA',
        quantity: data.quantity,
      },
    });

    return created;
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
    where.category = { contains: filters.category.trim() };
  }

  if (filters?.manufacturer?.trim()) {
    where.manufacturer = { contains: filters.manufacturer.trim() };
  }

  const parts = await prisma.part.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (filters?.lowStock === 'true') {
    return parts
      .filter(
        (part) =>
          part.minQuantity !== null &&
          part.minQuantity !== undefined &&
          part.quantity < part.minQuantity
      )
      .map(formatPart);
  }

  return parts.map(formatPart);
};

export const getPartById = async (id: string): Promise<Part | null> => {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  const part = await prisma.part.findUnique({ where: { id: numericId } });
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

  const nextName = data.name ?? existing.name;
  const nextManufacturer =
    data.manufacturer !== undefined ? data.manufacturer : existing.manufacturer;

  const isDuplicate = await checkDuplicateNameManufacturer(
    nextName,
    nextManufacturer,
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
        updateData[key] = value.trim() || null;
        changedFields[key] = value.trim() || null;
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

  const existing = await prisma.part.findUnique({ where: { id: numericId } });
  if (!existing) {
    const error = new Error('Peça não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const movementCount = await prisma.stockMovement.count({
    where: { partId: numericId },
  });

  if (movementCount > 0) {
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
    });

    await createPartAuditLog(
      numericId,
      'DELETE',
      {
        status: 'Inativo',
        inactivatedAt: new Date().toISOString(),
        reason: 'Exclusão lógica — peça com histórico de movimentações',
      },
      userId
    );

    return {
      part: formatPart(inactivated),
      message:
        'Não é possível excluir peça com histórico de movimentações. Peça inativada com sucesso.',
    };
  }

  await prisma.part.delete({ where: { id: numericId } });

  return {
    part: formatPart(existing),
    message: 'Peça excluída com sucesso',
  };
};

export { getAllParts as getPartsForReport };
