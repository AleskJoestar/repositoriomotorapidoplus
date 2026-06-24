import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { buildXmlReport } from '@/utils/xmlBuilder';
import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';
import { formatReportDateTime } from '@/utils/reportFormat';

const prisma = new PrismaClient();
const MARGIN = 50;

const REPORT_COLUMNS: PdfTableColumn[] = [
  { header: 'ID', weight: 1, align: 'center' },
  { header: 'Nome', weight: 4 },
  { header: 'Status', weight: 2, align: 'center' },
  { header: 'Criado em', weight: 3 },
  { header: 'Atualizado em', weight: 3 },
  { header: 'Inativado em', weight: 3 },
];

const formatCategoryRow = (item: CategoryDto): string[] => [
  String(item.id),
  item.name,
  item.status,
  formatReportDateTime(item.createdAt),
  formatReportDateTime(item.updatedAt),
  formatReportDateTime(item.inactivatedAt),
];

export interface CategoryDto {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

export const getAllCategories = async (
  includeInactive = false
): Promise<CategoryDto[]> => {
  return prisma.category.findMany({
    where: includeInactive ? undefined : { status: 'Ativo' },
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (data: { name: string }): Promise<CategoryDto> => {
  const dup = await prisma.category.findUnique({
    where: { name: data.name.trim() },
  });
  if (dup) {
    const error = new Error('Categoria já cadastrada');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }
  return prisma.category.create({ data: { name: data.name.trim() } });
};

export const updateCategory = async (
  id: number,
  data: { name: string }
): Promise<CategoryDto> => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Categoria não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (data.name.trim() !== existing.name) {
    const dup = await prisma.category.findUnique({
      where: { name: data.name.trim() },
    });
    if (dup) {
      const error = new Error('Categoria já cadastrada');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }
  return prisma.category.update({
    where: { id },
    data: { name: data.name.trim() },
  });
};

export const inactivateCategory = async (id: number): Promise<CategoryDto> => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Categoria não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  return prisma.category.update({
    where: { id },
    data: { status: 'Inativo', inactivatedAt: new Date() },
  });
};

export const reactivateCategory = async (id: number): Promise<CategoryDto> => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Categoria não encontrada');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (existing.status === 'Ativo') return existing;
  return prisma.category.update({
    where: { id },
    data: { status: 'Ativo', inactivatedAt: null },
  });
};

export const generateCategoriesPdf = async (): Promise<Buffer> => {
  const items = await getAllCategories(true);
  const now = new Date().toLocaleString('pt-BR');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(14).text('Relatório de Categorias', { align: 'center' });
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
        rows: items.map(formatCategoryRow),
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

export const generateCategoriesXml = async (): Promise<string> => {
  const items = await getAllCategories(true);
  return buildXmlReport(
    'categorias',
    'categoria',
    items.map((c) => ({
      id: c.id,
      nome: c.name,
      status: c.status,
      criadoEm: formatReportDateTime(c.createdAt),
      atualizadoEm: formatReportDateTime(c.updatedAt),
      inativadoEm: formatReportDateTime(c.inactivatedAt),
    }))
  );
};
