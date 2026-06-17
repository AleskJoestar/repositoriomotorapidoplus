import { PrismaClient } from '@prisma/client';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AuditLog,
} from '@/types';

const prisma = new PrismaClient();

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
    // Não throw para não quebrar a operação principal
  }
};

/**
 * Converter Decimal do Prisma para number
 */
const formatEmployee = (employee: any): Employee => {
  return {
    ...employee,
    salary: employee.salary ? Number(employee.salary) : 0,
  };
};

/**
 * RF03 - Criar novo funcionário
 */
export const createEmployee = async (
  data: CreateEmployeeRequest,
  userId: string
): Promise<Employee> => {
  // Validar CPF duplicado
  const existingCPF = await prisma.employee.findUnique({
    where: { cpf: data.cpf },
  });

  if (existingCPF) {
    const error = new Error('Dados fornecidos são inválidos');
    (error as any).statusCode = 409;
    throw error;
  }

  // Validar email duplicado
  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email },
  });

  if (existingEmail) {
    const error = new Error('Dados fornecidos são inválidos');
    (error as any).statusCode = 409;
    throw error;
  }

  // Criar funcionário
  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      cpf: data.cpf,
      rg: data.rg,
      email: data.email,
      phone: data.phone,
      cargo: data.cargo,
      department: data.department,
      birthDate: new Date(data.birthDate),
      hireDate: new Date(data.hireDate),
      salary: Number(data.salary),
      address: data.address,
      status: 'Ativo',
    },
  });

  // Registrar auditoria
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
export const getAllEmployees = async (filters?: {
  cargo?: string;
  department?: string;
  status?: string;
}): Promise<Employee[]> => {
  const where: any = {};

  // Filtro de status (padrão: apenas Ativos, mas se vazio retorna todos)
  if (filters?.status === undefined || filters?.status === '') {
    where.status = 'Ativo'; // Padrão ao abrir a página
  } else if (filters?.status === 'todos') {
    // Se enviar 'todos', não filtra por status (retorna todos)
  } else {
    where.status = filters.status;
  }

  // Filtros adicionais (sem mode: insensitive pois SQLite não suporta)
  if (filters?.cargo && filters.cargo.trim() !== '') {
    where.cargo = {
      contains: filters.cargo,
    };
  }

  if (filters?.department && filters.department.trim() !== '') {
    where.department = {
      contains: filters.department,
    };
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      cpf: true,
      rg: true,
      email: true,
      phone: true,
      cargo: true,
      department: true,
      birthDate: true,
      hireDate: true,
      salary: true,
      address: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      inactivatedAt: true,
    },
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

  // Validar existência
  const existingEmployee = await prisma.employee.findUnique({
    where: { id: numericId },
  });

  if (!existingEmployee) {
    const error = new Error('Funcionário não encontrado');
    (error as any).statusCode = 404;
    throw error;
  }

  // Se CPF foi alterado, validar duplicidade
  if (data.cpf && data.cpf !== existingEmployee.cpf) {
    const cpfExists = await prisma.employee.findUnique({
      where: { cpf: data.cpf },
    });

    if (cpfExists) {
      const error = new Error('CPF já cadastrado no sistema');
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // Se email foi alterado, validar duplicidade
  if (data.email && data.email !== existingEmployee.email) {
    const emailExists = await prisma.employee.findFirst({
      where: {
        email: data.email,
        NOT: { id: numericId },
      },
    });

    if (emailExists) {
      const error = new Error('E-mail já cadastrado no sistema');
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // Preparar dados para atualização
  const updateData: any = {};
  const changedFields: Record<string, any> = {};

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

  // Atualizar funcionário
  const updatedEmployee = await prisma.employee.update({
    where: { id: numericId },
    data: updateData,
  });

  // Registrar auditoria
  if (Object.keys(changedFields).length > 0) {
    await createAuditLog(numericId, 'UPDATE', changedFields, userId);
  }

  return formatEmployee(updatedEmployee);
};

/**
 * RF05 - Deletar funcionário (exclusão lógica)
 */
export const deleteEmployee = async (
  id: string,
  userId: string
): Promise<Employee> => {
  const numericId = parseInt(id, 10);

  // Validar existência
  const existingEmployee = await prisma.employee.findUnique({
    where: { id: numericId },
  });

  if (!existingEmployee) {
    const error = new Error('Funcionário não encontrado');
    (error as any).statusCode = 404;
    throw error;
  }

  // Se status é "Ativo", desativar
  if (existingEmployee.status === 'Ativo') {
    const deletedEmployee = await prisma.employee.update({
      where: { id: numericId },
      data: {
        status: 'Inativo',
        inactivatedAt: new Date(),
      },
    });

    // Registrar auditoria
    await createAuditLog(
      numericId,
      'DELETE',
      {
        status: 'Inativo',
        inactivatedAt: new Date().toISOString(),
      },
      userId
    );

    return formatEmployee(deletedEmployee);
  }

  // Se status é "Inativo", permitir reativação
  const reactivatedEmployee = await prisma.employee.update({
    where: { id: numericId },
    data: {
      status: 'Ativo',
      inactivatedAt: null,
    },
  });

  // Registrar auditoria
  await createAuditLog(
    numericId,
    'UPDATE',
    {
      status: 'Ativo',
      inactivatedAt: null,
    },
    userId
  );

  return formatEmployee(reactivatedEmployee);
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
