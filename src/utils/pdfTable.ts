import PDFDocument from 'pdfkit';

export interface PdfTableColumn {
  header: string;
  weight: number;
  align?: 'left' | 'center' | 'right';
}

export interface DrawPdfTableOptions {
  doc: PDFKit.PDFDocument;
  columns: PdfTableColumn[];
  rows: string[][];
  startX?: number;
  marginBottom?: number;
  cellPadding?: number;
  fontSize?: number;
  headerFontSize?: number;
  repeatHeader?: boolean;
  onPageBreak?: () => void;
}

const HEADER_FILL = '#e5e7eb';
const BORDER_COLOR = '#9ca3af';
const HEADER_TEXT = '#111827';
const BODY_TEXT = '#374151';
const LINE_GAP = 1;

const resolveFontSizes = (
  columnCount: number,
  fontSize: number,
  headerFontSize: number
): { body: number; header: number } => {
  if (columnCount > 14) {
    return { body: Math.min(fontSize, 4.8), header: Math.min(headerFontSize, 5.3) };
  }
  if (columnCount > 10) {
    return { body: Math.min(fontSize, 5.2), header: Math.min(headerFontSize, 5.7) };
  }
  if (columnCount > 7) {
    return { body: Math.min(fontSize, 5.8), header: Math.min(headerFontSize, 6.3) };
  }
  return { body: fontSize, header: headerFontSize };
};

export const drawPdfTable = (options: DrawPdfTableOptions): void => {
  const {
    doc,
    columns,
    rows,
    startX = 50,
    marginBottom = 45,
    cellPadding = 4,
    fontSize = 6,
    headerFontSize = 6.5,
    repeatHeader = true,
    onPageBreak,
  } = options;

  const { body: bodyFontSize, header: headerFontSizeResolved } = resolveFontSizes(
    columns.length,
    fontSize,
    headerFontSize
  );

  const pageWidth = doc.page.width - startX * 2;
  const totalWeight = columns.reduce((sum, column) => sum + column.weight, 0);
  const colWidths = columns.map((column) => (column.weight / totalWeight) * pageWidth);
  const colX: number[] = [];
  colWidths.reduce((x, width) => {
    colX.push(x);
    return x + width;
  }, startX);

  const bottomLimit = () => doc.page.height - marginBottom;

  const measureRowHeight = (cells: string[], size: number, bold = false): number => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size);
    let maxHeight = size + cellPadding * 2;

    cells.forEach((cell, index) => {
      const textWidth = Math.max(colWidths[index] - cellPadding * 2, 8);
      const height = doc.heightOfString(cell || '-', {
        width: textWidth,
        align: columns[index].align ?? 'left',
        lineGap: LINE_GAP,
      });
      maxHeight = Math.max(maxHeight, height + cellPadding * 2);
    });

    return maxHeight;
  };

  const ensureSpace = (rowHeight: number): void => {
    if (doc.y + rowHeight <= bottomLimit()) return;

    doc.addPage();
    onPageBreak?.();
    doc.x = startX;
    doc.y = startX;
  };

  const drawHeaderRow = (): void => {
    doc.x = startX;
    const headerCells = columns.map((column) => column.header);
    const rowHeight = measureRowHeight(headerCells, headerFontSizeResolved, true);

    ensureSpace(rowHeight);
    const y = doc.y;

    columns.forEach((column, index) => {
      const x = colX[index];
      const width = colWidths[index];

      doc.save();
      doc.fillColor(HEADER_FILL).strokeColor(BORDER_COLOR);
      doc.rect(x, y, width, rowHeight).fillAndStroke();
      doc.fillColor(HEADER_TEXT);
      doc.font('Helvetica-Bold').fontSize(headerFontSizeResolved);
      doc.text(column.header, x + cellPadding, y + cellPadding, {
        width: width - cellPadding * 2,
        align: column.align ?? 'left',
        lineBreak: true,
        lineGap: LINE_GAP,
      });
      doc.restore();
    });

    doc.x = startX;
    doc.y = y + rowHeight;
  };

  doc.x = startX;
  drawHeaderRow();
  doc.font('Helvetica').fontSize(bodyFontSize);

  rows.forEach((row) => {
    doc.x = startX;
    const cells = columns.map((_, index) => row[index] ?? '-');
    const rowHeight = measureRowHeight(cells, bodyFontSize);

    if (doc.y + rowHeight > bottomLimit()) {
      doc.addPage();
      onPageBreak?.();
      doc.x = startX;
      doc.y = startX;
      if (repeatHeader) {
        drawHeaderRow();
      }
    }

    const y = doc.y;

    columns.forEach((column, index) => {
      const x = colX[index];
      const width = colWidths[index];

      doc.save();
      doc.strokeColor(BORDER_COLOR);
      doc.rect(x, y, width, rowHeight).stroke();
      doc.fillColor(BODY_TEXT);
      doc.font('Helvetica').fontSize(bodyFontSize);
      doc.text(cells[index], x + cellPadding, y + cellPadding, {
        width: width - cellPadding * 2,
        align: column.align ?? 'left',
        lineBreak: true,
        lineGap: LINE_GAP,
      });
      doc.restore();
    });

    doc.x = startX;
    doc.y = y + rowHeight;
  });
};

export const addPdfPageFooters = (
  doc: PDFKit.PDFDocument,
  startX = 50,
  label = (page: number) => `Página ${page}`
): void => {
  const range = doc.bufferedPageRange();
  const pageWidth = doc.page.width - startX * 2;

  for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
    doc.switchToPage(pageIndex);
    doc.font('Helvetica').fontSize(8).fillColor('#6b7280');
    doc.text(label(pageIndex - range.start + 1), startX, doc.page.height - 35, {
      align: 'center',
      width: pageWidth,
      lineBreak: false,
    });
  }
};

export type PdfDoc = InstanceType<typeof PDFDocument>;

export const resetPdfCursor = (doc: PDFKit.PDFDocument, startX = 50): void => {
  doc.x = startX;
};
