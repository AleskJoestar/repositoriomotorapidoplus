import PDFDocument from 'pdfkit';
import { SaleFilters, SaleReportRow } from '@/types/sale';
import { getSalesReport } from '@/services/saleService';
import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';
import { formatSaleDateTime } from '@/utils/reportFormat';
import { buildXmlReport } from '@/utils/xmlBuilder';

const MARGIN = 50;

const REPORT_COLUMNS: PdfTableColumn[] = [
  { header: 'ID', weight: 0.7, align: 'center' },
  { header: 'Itens', weight: 5.5 },
  { header: 'Valor', weight: 1.3, align: 'right' },
  { header: 'Pagamento', weight: 1.5, align: 'center' },
  { header: 'Data/Hora', weight: 2.2, align: 'center' },
  { header: 'Vendedor', weight: 2.8 },
];

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatSaleRow = (sale: SaleReportRow): string[] => [
  String(sale.id),
  sale.itemsSummary.split('; ').join('\n'),
  formatCurrency(sale.totalAmount),
  sale.paymentMethod,
  formatSaleDateTime(sale.soldAt),
  sale.sellerName,
];

export const generateSalesPdf = async (
  filters?: SaleFilters
): Promise<Buffer> => {
  const sales = await getSalesReport(filters);
  const now = formatSaleDateTime(new Date());

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(14).text('Relatório de Vendas', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(`Gerado em: ${now}`, { align: 'center' });
    doc.moveDown(1.2);
    resetPdfCursor(doc, MARGIN);

    if (sales.length === 0) {
      doc.fontSize(9).text('Nenhuma venda encontrada.', { align: 'center' });
    } else {
      drawPdfTable({
        doc,
        columns: REPORT_COLUMNS,
        rows: sales.map(formatSaleRow),
        startX: MARGIN,
        fontSize: 7,
        headerFontSize: 7.5,
        repeatHeader: true,
      });
      doc.moveDown(0.8);
      doc.fontSize(8).text(`Total de vendas: ${sales.length}`, {
        align: 'right',
        width: doc.page.width - MARGIN * 2,
      });
    }

    addPdfPageFooters(doc, MARGIN);
    doc.end();
  });
};

export const generateSalesXml = async (
  filters?: SaleFilters
): Promise<string> => {
  const sales = await getSalesReport(filters);
  return buildXmlReport(
    'vendas',
    'venda',
    sales.map((sale) => ({
      id: sale.id,
      itens: sale.itemsSummary,
      valor: sale.totalAmount,
      metodoPagamento: sale.paymentMethod,
      dataHora: formatSaleDateTime(sale.soldAt),
      vendedor: sale.sellerName,
      vendedorId: sale.userId,
    }))
  );
};
