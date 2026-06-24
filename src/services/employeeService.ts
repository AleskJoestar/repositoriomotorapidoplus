import { PrismaClient } from '@prisma/client';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AuditLog,
  EmployeeFilters,
} from '@/types';

const prisma = new PrismaClient();

const employeeInclude = {
  department: { select: { name: true } },
  position: { select: { name: true } },
  user: { select: { id: true } },
} as const;

/**
 * Registrar auditoria de ação
 */
const createAuditLog = async (
  employeeId: number,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  changedFields: Record<string, any>,
  userId: string
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        employeeId,
        action,
        changedFields: JSON.stringify(changedFields),
        userId,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

type EmployeeWithRelations = {
  id: number;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  departmentId: number;
  positionId: number;
  birthDate: Date;
  hireDate: Date;
  salary: number;
  address: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
  department?: { name: string };
  position?: { name: string };
};

/**
 * Converter registro Prisma para Employee com nomes de relação
 */
const formatEmployee = (employee: EmployeeWithRelations): Employee => {
  return {
    id: employee.id,
    name: employee.name,
    cpf: employee.cpf,
    rg: employee.rg,
    email: employee.email,
    phone: employee.phone,
    departmentId: employee.departmentId,
    departmentName: employee.department?.name ?? '',
    positionId: employee.positionId,
    positionName: employee.position?.name ?? '',
    birthDate: employee.birthDate,
    hireDate: employee.hireDate,
    salary: employee.salary ? Number(employee.salary) : 0,
    address: employee.address,
    status: employee.status as Employee['status'],
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
    inactivatedAt: employee.inactivatedAt,
  };
};

const validateDepartmentAndPosition = async (
  departmentId: number,
  positionId: number
): Promise<void> => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    const error = new Error('Departamento não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (department.status !== 'Ativo') {
    const error = new Error('Departamento inativo não pode ser vinculado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const position = await prisma.position.findFirst({
    where: { id: positionId, departmentId },
  });

  if (!position) {
    const error = new Error('Cargo não encontrado ou não pertence ao departamento informado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (position.status !== 'Ativo') {
    const error = new Error('Cargo inativo não pode ser vinculado');
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }
};

const cascadeInactivateLinkedUser = async (employeeId: number): Promise<void> => {
  const linkedUser = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (linkedUser && linkedUser.status === 'Ativo' && !linkedUser.isMasterSeed) {
    await prisma.user.update({
      where: { id: linkedUser.id },
      data: { status: 'Inativo', inactivatedAt: new Date() },
    });
  }
};

/**
 * RF03 - Criar novo funcionário
 */
export const createEmployee = async (
  data: CreateEmployeeRequest,
  userId: string
): Promise<Employee> => {
  await validateDepartmentAndPosition(data.departmentId, data.positionId);

  const existingCPF = await prisma.employee.findUnique({
    where: { cpf: data.cpf },
  });

  if (existingCPF) {
    const error = new Error('Dados fornecidos são inválidos');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email },
  });

  if (existingEmail) {
    const error = new Error('Dados fornecidos são inválidos');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      cpf: data.cpf,
      rg: data.rg,
      email: data.email,
      phone: data.phone,
      departmentId: data.departmentId,
      positionId: data.positionId,
      birthDate: new Date(data.birthDate),
      hireDate: new Date(data.hireDate),
      salary: Number(data.salary),
      address: data.address,
      status: data.status ?? 'Ativo',
    },
    include: employeeInclude,
  });

  await createAuditLog(
    employee.id,
    'CREATE',
    { ...data, salary: String(data.salary) },
    userId
  );

  return formatEmployee(employee);
};

/**
 * Buscar todos os funcionários com filtros opcionais
 */
export const getAllEmployees = async (
  filters?: EmployeeFilters
): Promise<Employee[]> => {
  const where: Record<string, unknown> = {};

  if (filters?.status === undefined || filters?.status === '') {
    where.status = 'Ativo';
  } else if (filters?.status !== 'todos') {
    where.status = filters.status;
  }

  if (filters?.position && filters.position.trim() !== '') {
    where.position = { name: { contains: filters.position.trim() } };
  }

  if (filters?.department && filters.department.trim() !== '') {
    where.department = { name: { contains: filters.department.trim() } };
  }

  if (filters?.hireDateFrom || filters?.hireDateTo) {
    const hireDate: Record<string, Date> = {};
    if (filters.hireDateFrom) {
      hireDate.gte = new Date(filters.hireDateFrom);
    }
    if (filters.hireDateTo) {
      const end = new Date(filters.hireDateTo);
      end.setHours(23, 59, 59, 999);
      hireDate.lte = end;
    }
    where.hireDate = hireDate;
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: employeeInclude,
  });

  return employees.map(formatEmployee);
};

/**
 * Buscar funcionário por ID
 */
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  const numericId = parseInt(id, 10);
  const employee = await prisma.employee.findUnique({
    where: { id: numericId },
    include: employeeInclude,
  });

  if (!employee) {
    return null;
  }

  return formatEmployee(employee);
};

/**
 * RF04 - Editar funcionário
 */
export const updateEmployee = async (
  id: string,
  data: UpdateEmployeeRequest,
  userId: string
): Promise<Employee> => {
  const numericId = parseInt(id, 10);

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: numericId },
  });

  if (!existingEmployee) {
    const error = new Error('Funcionário não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const nextDepartmentId = data.departmentId ?? existingEmployee.departmentId;
  const nextPositionId = data.positionId ?? existingEmployee.positionId;

  if (data.departmentId !== undefined || data.positionId !== undefined) {
    await validateDepartmentAndPosition(nextDepartmentId, nextPositionId);
  }

  if (data.cpf && data.cpf !== existingEmployee.cpf) {
    const cpfExists = await prisma.employee.findUnique({
      where: { cpf: data.cpf },
    });

    if (cpfExists) {
      const error = new Error('CPF já cadastrado no sistema');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  if (data.email && data.email !== existingEmployee.email) {
    const emailExists = await prisma.employee.findFirst({
      where: {
        email: data.email,
        NOT: { id: numericId },
      },
    });

    if (emailExists) {
      const error = new Error('E-mail já cadastrado no sistema');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  const updateData: Record<string, unknown> = {};
  const changedFields: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'birthDate' || key === 'hireDate') {
        updateData[key] = new Date(value as string | Date);
        changedFields[key] = String(value);
      } else if (key === 'salary') {
        updateData[key] = Number(value);
        changedFields[key] = String(value);
      } else {
        updateData[key] = value;
        changedFields[key] = value;
      }
    }
  });

  const updatedEmployee = await prisma.employee.update({
    where: { id: numericId },
    data: updateData,
    include: employeeInclude,
  });

  if (Object.keys(changedFields).length > 0) {
    await createAuditLog(numericId, 'UPDATE', changedFields, userId);
  }

  return formatEmployee(updatedEmployee);
};

/**
 * RF05 - Deletar funcionário
 * Exclusão lógica se houver logs além de CREATE ou usuário vinculado; caso contrário, exclusão física
 */
export const deleteEmployee = async (
  id: string,
  userId: string
): Promise<Employee> => {
  const numericId = parseInt(id, 10);

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: numericId },
    include: employeeInclude,
  });

  if (!existingEmployee) {
    const error = new Error('Funcionário não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const [nonCreateAuditCount, linkedUser] = await Promise.all([
    prisma.auditLog.count({
      where: {
        employeeId: numericId,
        action: { not: 'CREATE' },
      },
    }),
    prisma.user.findUnique({
      where: { employeeId: numericId },
    }),
  ]);

  const requiresLogicalDelete = nonCreateAuditCount > 0 || linkedUser !== null;

  if (requiresLogicalDelete) {
    if (existingEmployee.status === 'Inativo') {
      return formatEmployee(existingEmployee);
    }

    const deletedEmployee = await prisma.employee.update({
      where: { id: numericId },
      data: {
        status: 'Inativo',
        inactivatedAt: new Date(),
      },
      include: employeeInclude,
    });

    await createAuditLog(
      numericId,
      'DELETE',
      {
        status: 'Inativo',
        inactivatedAt: new Date().toISOString(),
        reason: linkedUser
          ? 'Exclusão lógica — funcionário com usuário vinculado (usuário inativado em cascata)'
          : 'Exclusão lógica — funcionário com histórico de alterações',
      },
      userId
    );

    await cascadeInactivateLinkedUser(numericId);

    return formatEmployee(deletedEmployee);
  }

  await prisma.auditLog.deleteMany({ where: { employeeId: numericId } });
  await prisma.employee.delete({ where: { id: numericId } });

  return formatEmployee(existingEmployee);
};

export const reactivateEmployee = async (
  id: string,
  userId: string
): Promise<Employee> => {
  const numericId = parseInt(id, 10);

  const existingEmployee = await prisma.employee.findUnique({
    where: { id: numericId },
    include: employeeInclude,
  });

  if (!existingEmployee) {
    const error = new Error('Funcionário não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (existingEmployee.status === 'Ativo') {
    return formatEmployee(existingEmployee);
  }

  const reactivated = await prisma.employee.update({
    where: { id: numericId },
    data: {
      status: 'Ativo',
      inactivatedAt: null,
    },
    include: employeeInclude,
  });

  await createAuditLog(
    numericId,
    'UPDATE',
    { status: 'Ativo', inactivatedAt: null },
    userId
  );

  return formatEmployee(reactivated);
};

/**
 * Buscar logs de auditoria de um funcionário
 */
export const getAuditLogs = async (employeeId: string): Promise<AuditLog[]> => {
  const numericId = parseInt(employeeId, 10);
  const logs = await prisma.auditLog.findMany({
    where: { employeeId: numericId },
    orderBy: { createdAt: 'desc' },
  });

  return logs.map((log) => ({
    ...log,
    changedFields: JSON.parse(log.changedFields),
    action: log.action as 'CREATE' | 'UPDATE' | 'DELETE',
  }));
};
