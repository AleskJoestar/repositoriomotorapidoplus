import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { buildXmlReport } from '@/utils/xmlBuilder';
import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';
import { formatReportDateTime } from '@/utils/reportFormat';

const prisma = new PrismaClient();
const MARGIN = 50;

const REPORT_COLUMNS: PdfTableColumn[] = [
  { header: 'ID', weight: 1, align: 'center' },
  { header: 'Nome', weight: 3 },
  { header: 'CNPJ', weight: 2.5 },
  { header: 'Endereço', weight: 3.5 },
  { header: 'Contato', weight: 2.5 },
  { header: 'Status', weight: 1.5, align: 'center' },
  { header: 'Criado em', weight: 2.8 },
  { header: 'Atualizado em', weight: 2.8 },
  { header: 'Inativado em', weight: 2.8 },
];

const formatManufacturerRow = (item: ManufacturerDto): string[] => [
  String(item.id),
  item.name,
  item.cnpj || '-',
  item.address || '-',
  item.contact || '-',
  item.status,
  formatReportDateTime(item.createdAt),
  formatReportDateTime(item.updatedAt),
  formatReportDateTime(item.inactivatedAt),
];

export interface ManufacturerDto {
  id: number;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  contact?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

const format = (m: {
  id: number;
  name: string;
  cnpj: string | null;
  address: string | null;
  contact: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt: Date | null;
}): ManufacturerDto => ({ ...m });

export const getAllManufacturers = async (
  includeInactive = false
): Promise<ManufacturerDto[]> => {
  return prisma.manufacturer.findMany({
    where: includeInactive ? undefined : { status: 'Ativo' },
    orderBy: { name: 'asc' },
  });
};

export const createManufacturer = async (data: {
  name: string;
  cnpj?: string;
  address?: string;
  contact?: string;
}): Promise<ManufacturerDto> => {
  const dup = await prisma.manufacturer.findUnique({
    where: { name: data.name.trim() },
  });
  if (dup) {
    const error = new Error('Fabricante já cadastrado');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }
  return prisma.manufacturer.create({
    data: {
      name: data.name.trim(),
      cnpj: data.cnpj?.trim() || null,
      address: data.address?.trim() || null,
      contact: data.contact?.trim() || null,
    },
  });
};

export const updateManufacturer = async (
  id: number,
  data: Partial<{ name: string; cnpj: string; address: string; contact: string }>
): Promise<ManufacturerDto> => {
  const existing = await prisma.manufacturer.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Fabricante não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (data.name && data.name.trim() !== existing.name) {
    const dup = await prisma.manufacturer.findUnique({
      where: { name: data.name.trim() },
    });
    if (dup) {
      const error = new Error('Fabricante já cadastrado');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }
  return prisma.manufacturer.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      cnpj: data.cnpj?.trim(),
      address: data.address?.trim(),
      contact: data.contact?.trim(),
    },
  });
};

export const inactivateManufacturer = async (
  id: number
): Promise<ManufacturerDto> => {
  const existing = await prisma.manufacturer.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Fabricante não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  return prisma.manufacturer.update({
    where: { id },
    data: { status: 'Inativo', inactivatedAt: new Date() },
  });
};

export const reactivateManufacturer = async (
  id: number
): Promise<ManufacturerDto> => {
  const existing = await prisma.manufacturer.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Fabricante não encontrado');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (existing.status === 'Ativo') return format(existing);
  return prisma.manufacturer.update({
    where: { id },
    data: { status: 'Ativo', inactivatedAt: null },
  });
};

export const generateManufacturersPdf = async (): Promise<Buffer> => {
  const items = await getAllManufacturers(true);
  const now = new Date().toLocaleString('pt-BR');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(14).text('Relatório de Fabricantes', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(`Gerado em: ${now}`, { align: 'center' });
    doc.moveDown(1.2);

    resetPdfCursor(doc, MARGIN);

    if (items.length === 0) {
      doc.fontSize(9).text('Nenhum registro encontrado.', { align: 'center' });
    } else {
      drawPdfTable({
        doc,
        columns: REPORT_COLUMNS,
        rows: items.map(formatManufacturerRow),
        startX: MARGIN,
        fontSize: 6,
        headerFontSize: 6.5,
      });
      doc.moveDown(0.8);
      doc.fontSize(8).text(`Total de registros: ${items.length}`, {
        align: 'right',
        width: doc.page.width - MARGIN * 2,
      });
    }

    addPdfPageFooters(doc, MARGIN);
    doc.end();
  });
};

export const generateManufacturersXml = async (): Promise<string> => {
  const items = await getAllManufacturers(true);
  return buildXmlReport(
    'fabricantes',
    'fabricante',
    items.map((m) => ({
      id: m.id,
      nome: m.name,
      cnpj: m.cnpj || '',
      endereco: m.address || '',
      contato: m.contact || '',
      status: m.status,
      criadoEm: formatReportDateTime(m.createdAt),
      atualizadoEm: formatReportDateTime(m.updatedAt),
      inativadoEm: formatReportDateTime(m.inactivatedAt),
    }))
  );
};
