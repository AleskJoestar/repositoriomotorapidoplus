import path from 'path';

import fs from 'fs';

import PDFDocument from 'pdfkit';

import ExcelJS from 'exceljs';

import { Part, PartFilters } from '@/types';

import { getAllParts } from '@/services/partService';

import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';



const LOGO_PATH = path.join(process.cwd(), 'assets', 'logo.png');

const MARGIN = 50;



const REPORT_COLUMNS: PdfTableColumn[] = [

  { header: 'ID', weight: 1, align: 'center' },

  { header: 'Código', weight: 2.2 },

  { header: 'Nome', weight: 3.5 },

  { header: 'Categoria', weight: 2.8 },

  { header: 'Fabricante', weight: 2.8 },

  { header: 'Qtd.', weight: 1.2, align: 'center' },

  { header: 'Preço', weight: 1.8, align: 'right' },

  { header: 'Descrição', weight: 4.5 },

  { header: 'Nº Série', weight: 2.5 },

  { header: 'Localização', weight: 2.5 },

  { header: 'Qtd. Mín.', weight: 1.3, align: 'center' },

  { header: 'Status', weight: 1.5, align: 'center' },

  { header: 'Criado em', weight: 3 },

  { header: 'Atualizado em', weight: 3 },

  { header: 'Inativado em', weight: 3 },

];



const REPORT_COLUMN_HEADERS = REPORT_COLUMNS.map((column) => column.header);



const formatDateTime = (date?: Date | null): string =>

  date ? new Date(date).toLocaleString('pt-BR') : '-';



const formatPartRow = (part: Part): string[] => [

  String(part.id),

  part.code,

  part.name,

  part.categoryName,

  part.manufacturerName,

  String(part.quantity),

  (part.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),

  part.description || '-',

  part.serialNumber || '-',

  part.location || '-',

  String(part.minQuantity),

  part.status,

  formatDateTime(part.createdAt),

  formatDateTime(part.updatedAt),

  formatDateTime(part.inactivatedAt),

];



const logoExists = (): boolean => fs.existsSync(LOGO_PATH);



export const generatePartsPdf = async (

  filters?: PartFilters

): Promise<Buffer> => {

  const parts = await getAllParts(filters);

  const now = new Date().toLocaleString('pt-BR');



  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });

    const chunks: Buffer[] = [];



    doc.on('data', (chunk) => chunks.push(chunk));

    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.on('error', reject);



    if (logoExists()) {

      const logoWidth = 70;

      const x = (doc.page.width - logoWidth) / 2;

      doc.image(LOGO_PATH, x, doc.y, { width: logoWidth });

      doc.moveDown(5);

    }



    doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827');

    doc.text('Relatório de Peças', { align: 'center' });

    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10).text('MotoRapido PLUS', { align: 'center' });

    doc.moveDown(0.5);

    doc.text(`Gerado em: ${now}`, { align: 'center' });

    doc.moveDown(1.2);

    resetPdfCursor(doc, MARGIN);



    if (parts.length === 0) {

      doc.fontSize(9).text('Nenhum registro encontrado.', { align: 'center' });

    } else {

      drawPdfTable({

        doc,

        columns: REPORT_COLUMNS,

        rows: parts.map(formatPartRow),

        startX: MARGIN,

        fontSize: 6,

        headerFontSize: 6.5,

        repeatHeader: true,

      });



      doc.moveDown(0.8);

      doc.font('Helvetica').fontSize(8).fillColor('#374151');

      doc.text(`Total de registros: ${parts.length}`, {

        align: 'right',

        width: doc.page.width - MARGIN * 2,

      });

    }



    addPdfPageFooters(doc, MARGIN);

    doc.end();

  });

};



export const generatePartsXlsx = async (

  filters?: PartFilters

): Promise<Buffer> => {

  const parts = await getAllParts(filters);

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet('Peças');



  let headerRowIndex = 1;



  if (logoExists()) {

    const imageId = workbook.addImage({

      filename: LOGO_PATH,

      extension: 'png',

    });

    sheet.addImage(imageId, {

      tl: { col: 0, row: 0 },

      ext: { width: 80, height: 80 },

    });

    sheet.getRow(1).height = 65;

    headerRowIndex = 5;

  }



  sheet.getCell(`A${headerRowIndex}`).value = 'MotoRapido PLUS';

  sheet.getCell(`A${headerRowIndex}`).font = { bold: true, size: 14 };

  sheet.getCell(`A${headerRowIndex + 1}`).value = 'Relatório de Peças';

  sheet.getCell(`A${headerRowIndex + 2}`).value =

    `Gerado em: ${new Date().toLocaleString('pt-BR')}`;



  const columnsRowIndex = headerRowIndex + 4;

  sheet.getRow(columnsRowIndex).values = REPORT_COLUMN_HEADERS;

  sheet.getRow(columnsRowIndex).font = { bold: true };



  parts.forEach((part, index) => {

    sheet.getRow(columnsRowIndex + 1 + index).values = formatPartRow(part);

  });



  const totalRowIndex = columnsRowIndex + 1 + parts.length + 1;

  sheet.getCell(`A${totalRowIndex}`).value =

    `Total de registros: ${parts.length}`;



  sheet.columns.forEach((column) => {

    column.width = 18;

  });



  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);

};


