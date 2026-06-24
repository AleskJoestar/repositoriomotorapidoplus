import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import { buildXmlReport } from '@/utils/xmlBuilder';
import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';
import { formatReportDateTime } from '@/utils/reportFormat';

const prisma = new PrismaClient();
const MARGIN = 50;

const USER_REPORT_COLUMNS: PdfTableColumn[] = [
  { header: 'ID', weight: 1, align: 'center' },
  { header: 'E-mail', weight: 3.5 },
  { header: 'Tipo Acesso', weight: 2, align: 'center' },
  { header: 'Func. ID', weight: 1.2, align: 'center' },
  { header: 'Funcionário', weight: 3 },
  { header: 'Semente', weight: 1.2, align: 'center' },
  { header: 'Status', weight: 1.5, align: 'center' },
  { header: 'Criado em', weight: 2.8 },
  { header: 'Atualizado em', weight: 2.8 },
  { header: 'Inativado em', weight: 2.8 },
];

const formatUserRow = (user: UserDto): string[] => [
  String(user.id),
  user.email,
  user.accessType,
  user.employeeId ? String(user.employeeId) : '-',
  user.employeeName || '-',
  user.isMasterSeed ? 'Sim' : 'Não',
  user.status,
  formatReportDateTime(user.createdAt),
  formatReportDateTime(user.updatedAt),
  formatReportDateTime(user.inactivatedAt),
];

export interface UserDto {
  id: number;
  email: string;
  accessType: string;
  isMasterSeed: boolean;
  employeeId?: number | null;
  employeeName?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

const formatUser = (user: {
  id: number;
  email: string;
  accessType: string;
  isMasterSeed: boolean;
  employeeId: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
  employee?: { name: string } | null;
}): UserDto => ({
  id: user.id,
  email: user.email,
  accessType: user.accessType,
  isMasterSeed: user.isMasterSeed,
  employeeId: user.employeeId,
  employeeName: user.employee?.name ?? null,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  inactivatedAt: user.inactivatedAt,
});

export const getAllUsers = async (): Promise<UserDto[]> => {
  const users = await prisma.user.findMany({
    include: { employee: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(formatUser);
};

export const createUser = async (data: {
  email: string;
  senha: string;
  employeeId?: number;
  accessType: 'MASTER' | 'COMUM';
}): Promise<UserDto> => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existing) {
    const error = new Error('E-mail já cadastrado');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  if (data.employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      const error = new Error('Funcionário não encontrado');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
    if (employee.status !== 'Ativo') {
      const error = new Error('Funcionário inativo não pode ser vinculado');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const linked = await prisma.user.findUnique({
      where: { employeeId: data.employeeId },
    });
    if (linked) {
      const error = new Error('Funcionário já vinculado a outro usuário');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  const hash = await bcrypt.hash(data.senha, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email.trim().toLowerCase(),
      password: hash,
      accessType: data.accessType,
      employeeId: data.employeeId ?? null,
      status: 'Ativo',
    },
    include: { employee: { select: { name: true } } },
  });
  return formatUser(user);
};

export const inactivateUser = async (id: number): Promise<UserDto> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('Usuário não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (user.isMasterSeed) {
    const error = new Error('Usuário semente não pode ser desativado');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { status: 'Inativo', inactivatedAt: new Date() },
    include: { employee: { select: { name: true } } },
  });
  return formatUser(updated);
};

export const reactivateUser = async (id: number): Promise<UserDto> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { employee: { select: { status: true } } },
  });
  if (!user) {
    const error = new Error('Usuário não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (user.isMasterSeed && user.status === 'Inativo') {
    const error = new Error('Usuário semente não pode ser desativado');
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }
  if (user.employeeId && user.employee?.status === 'Inativo') {
    const error = new Error(
      'Não é possível reativar usuário enquanto o funcionário vinculado estiver inativo'
    );
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }
  if (user.status === 'Ativo') {
    const current = await prisma.user.findUnique({
      where: { id },
      include: { employee: { select: { name: true } } },
    });
    return formatUser(current!);
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { status: 'Ativo', inactivatedAt: null },
    include: { employee: { select: { name: true } } },
  });
  return formatUser(updated);
};

export const generateUsersPdf = async (): Promise<Buffer> => {
  const users = await getAllUsers();
  const now = new Date().toLocaleString('pt-BR');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(14).text('Relatório de Usuários', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(`Gerado em: ${now}`, { align: 'center' });
    doc.moveDown(1.2);

    resetPdfCursor(doc, MARGIN);

    if (users.length === 0) {
      doc.fontSize(9).text('Nenhum registro encontrado.', { align: 'center' });
    } else {
      drawPdfTable({
        doc,
        columns: USER_REPORT_COLUMNS,
        rows: users.map(formatUserRow),
        startX: MARGIN,
        fontSize: 6,
        headerFontSize: 6.5,
      });
      doc.moveDown(0.8);
      doc.fontSize(8).text(`Total de registros: ${users.length}`, {
        align: 'right',
        width: doc.page.width - MARGIN * 2,
      });
    }

    addPdfPageFooters(doc, MARGIN);
    doc.end();
  });
};

export const generateUsersXml = async (): Promise<string> => {
  const users = await getAllUsers();
  return buildXmlReport(
    'usuarios',
    'usuario',
    users.map((u) => ({
      id: u.id,
      email: u.email,
      tipoAcesso: u.accessType,
      funcionarioId: u.employeeId ?? '',
      funcionario: u.employeeName || '',
      sementeMaster: u.isMasterSeed ? 'Sim' : 'Não',
      status: u.status,
      criadoEm: formatReportDateTime(u.createdAt),
      atualizadoEm: formatReportDateTime(u.updatedAt),
      inativadoEm: formatReportDateTime(u.inactivatedAt),
    }))
  );
};
