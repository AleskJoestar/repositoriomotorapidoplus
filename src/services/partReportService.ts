import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Part, PartFilters } from '@/types';
import { getAllParts } from '@/services/partService';

const REPORT_COLUMNS = [
  'Código',
  'Nome',
  'Categoria',
  'Fabricante',
  'Quantidade em Estoque',
  'Localização',
  'Status',
];

const formatPartRow = (part: Part): string[] => [
  part.code,
  part.name,
  part.category,
  part.manufacturer || '-',
  String(part.quantity),
  part.location || '-',
  part.status,
];

export const generatePartsPdf = async (
  filters?: PartFilters
): Promise<Buffer> => {
  const parts = await getAllParts(filters);
  const now = new Date().toLocaleString('pt-BR');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('MotoRapido PLUS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('Relatório de Peças', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Gerado em: ${now}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(9).text(REPORT_COLUMNS.join(' | '));
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    parts.forEach((part, index) => {
      if (doc.y > 720) {
        doc.addPage();
        doc.fontSize(8).text(`Página ${doc.bufferedPageRange().count}`, {
          align: 'center',
        });
        doc.moveDown(1);
      }

      doc.fontSize(8).text(formatPartRow(part).join(' | '));
      doc.moveDown(0.3);

      if (index === parts.length - 1) {
        doc.moveDown(1);
        doc.fontSize(8).text(`Total de registros: ${parts.length}`, {
          align: 'right',
        });
      }
    });

    doc.end();
  });
};

export const generatePartsXlsx = async (
  filters?: PartFilters
): Promise<Buffer> => {
  const parts = await getAllParts(filters);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Peças');

  sheet.addRow(['MotoRapido PLUS']);
  sheet.addRow(['Relatório de Peças']);
  sheet.addRow([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
  sheet.addRow([]);
  sheet.addRow(REPORT_COLUMNS);

  const headerRow = sheet.getRow(5);
  headerRow.font = { bold: true };

  parts.forEach((part) => {
    sheet.addRow(formatPartRow(part));
  });

  sheet.addRow([]);
  sheet.addRow([`Total de registros: ${parts.length}`]);

  sheet.columns.forEach((column) => {
    column.width = 22;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
