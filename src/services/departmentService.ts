import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PositionDto {
  id: number;
  name: string;
  status: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  status: string;
  positions: PositionDto[];
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

const formatDepartment = (dept: {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
  positions: { id: number; name: string; status: string }[];
}): DepartmentDto => ({
  id: dept.id,
  name: dept.name,
  status: dept.status,
  positions: dept.positions,
  createdAt: dept.createdAt,
  updatedAt: dept.updatedAt,
  inactivatedAt: dept.inactivatedAt,
});

export const getAllDepartments = async (includeInactive = false): Promise<DepartmentDto[]> => {
  const departments = await prisma.department.findMany({
    where: includeInactive ? undefined : { status: 'Ativo' },
    include: {
      positions: {
        where: includeInactive ? undefined : { status: 'Ativo' },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });
  return departments.map(formatDepartment);
};

export const getDepartmentById = async (id: number): Promise<DepartmentDto | null> => {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { positions: { orderBy: { name: 'asc' } } },
  });
  return dept ? formatDepartment(dept) : null;
};

export const createDepartment = async (data: {
  name: string;
  positions: string[];
}): Promise<DepartmentDto> => {
  const existing = await prisma.department.findUnique({
    where: { name: data.name.trim() },
  });
  if (existing) {
    const error = new Error('Departamento já cadastrado');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const dept = await prisma.department.create({
    data: {
      name: data.name.trim(),
      positions: {
        create: data.positions
          .map((p) => p.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      },
    },
    include: { positions: true },
  });
  return formatDepartment(dept);
};

export const updateDepartment = async (
  id: number,
  data: { name?: string; positions?: string[] }
): Promise<DepartmentDto> => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Departamento não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (data.name && data.name.trim() !== existing.name) {
    const dup = await prisma.department.findUnique({
      where: { name: data.name.trim() },
    });
    if (dup) {
      const error = new Error('Departamento já cadastrado');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  if (data.positions) {
    const names = data.positions.map((p) => p.trim()).filter(Boolean);
    if (names.length === 0) {
      const error = new Error('Informe ao menos um cargo');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
  }

  await prisma.$transaction(async (tx) => {
    if (data.name) {
      await tx.department.update({
        where: { id },
        data: { name: data.name.trim() },
      });
    }

    if (data.positions) {
      const names = data.positions.map((p) => p.trim()).filter(Boolean);
      const current = await tx.position.findMany({ where: { departmentId: id } });

      for (const pos of current) {
        if (!names.includes(pos.name)) {
          await tx.position.update({
            where: { id: pos.id },
            data: { status: 'Inativo', inactivatedAt: new Date() },
          });
        }
      }

      for (const name of names) {
        const found = current.find((p) => p.name === name);
        if (found) {
          if (found.status === 'Inativo') {
            await tx.position.update({
              where: { id: found.id },
              data: { status: 'Ativo', inactivatedAt: null },
            });
          }
        } else {
          await tx.position.create({ data: { name, departmentId: id } });
        }
      }
    }
  });

  const updated = await getDepartmentById(id);
  return updated!;
};

export const inactivateDepartment = async (id: number): Promise<DepartmentDto> => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Departamento não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  await prisma.$transaction([
    prisma.department.update({
      where: { id },
      data: { status: 'Inativo', inactivatedAt: new Date() },
    }),
    prisma.position.updateMany({
      where: { departmentId: id },
      data: { status: 'Inativo', inactivatedAt: new Date() },
    }),
  ]);

  const updated = await getDepartmentById(id);
  return updated!;
};

export const reactivateDepartment = async (id: number): Promise<DepartmentDto> => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Departamento não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (existing.status === 'Ativo') {
    const current = await getDepartmentById(id);
    return current!;
  }

  await prisma.$transaction([
    prisma.department.update({
      where: { id },
      data: { status: 'Ativo', inactivatedAt: null },
    }),
    prisma.position.updateMany({
      where: { departmentId: id },
      data: { status: 'Ativo', inactivatedAt: null },
    }),
  ]);

  const updated = await getDepartmentById(id);
  return updated!;
};

export const getPositionsByDepartment = async (
  departmentId: number
): Promise<PositionDto[]> => {
  return prisma.position.findMany({
    where: { departmentId, status: 'Ativo' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, status: true },
  });
};
