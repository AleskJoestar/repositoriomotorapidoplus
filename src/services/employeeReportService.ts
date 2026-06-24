import PDFDocument from 'pdfkit';

import ExcelJS from 'exceljs';

import { Employee, EmployeeFilters } from '@/types';

import { getAllEmployees } from '@/services/employeeService';

import { drawPdfTable, addPdfPageFooters, resetPdfCursor, PdfTableColumn } from '@/utils/pdfTable';

import { formatReportDate, formatReportDateTime } from '@/utils/reportFormat';



const MARGIN = 50;



const REPORT_COLUMNS: PdfTableColumn[] = [

  { header: 'ID', weight: 1, align: 'center' },

  { header: 'Nome', weight: 3 },

  { header: 'CPF', weight: 2.2 },

  { header: 'RG', weight: 1.5 },

  { header: 'E-mail', weight: 2.8 },

  { header: 'Telefone', weight: 2 },

  { header: 'Depto ID', weight: 1.2, align: 'center' },

  { header: 'Departamento', weight: 2.5 },

  { header: 'Cargo ID', weight: 1.2, align: 'center' },

  { header: 'Cargo', weight: 2.5 },

  { header: 'Nascimento', weight: 2 },

  { header: 'Admissão', weight: 2 },

  { header: 'Salário', weight: 2 },

  { header: 'Endereço', weight: 3.5 },

  { header: 'Status', weight: 1.3, align: 'center' },

  { header: 'Criado em', weight: 2.5 },

  { header: 'Atualizado em', weight: 2.5 },

  { header: 'Inativado em', weight: 2.5 },

];



const REPORT_HEADERS = REPORT_COLUMNS.map((column) => column.header);



const formatCPF = (cpf: string): string => {

  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return cpf;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

};



const formatSalary = (salary: number): string =>

  salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });



const formatEmployeeRow = (employee: Employee): string[] => [

  String(employee.id),

  employee.name,

  formatCPF(employee.cpf),

  employee.rg,

  employee.email,

  employee.phone,

  String(employee.departmentId),

  employee.departmentName,

  String(employee.positionId),

  employee.positionName,

  formatReportDate(employee.birthDate),

  formatReportDate(employee.hireDate),

  formatSalary(employee.salary),

  employee.address,

  employee.status,

  formatReportDateTime(employee.createdAt),

  formatReportDateTime(employee.updatedAt),

  formatReportDateTime(employee.inactivatedAt),

];



export const generateEmployeesPdf = async (

  filters?: EmployeeFilters

): Promise<Buffer> => {

  const employees = await getAllEmployees(filters);

  const now = new Date().toLocaleString('pt-BR');



  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });

    const chunks: Buffer[] = [];



    doc.on('data', (chunk) => chunks.push(chunk));

    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.on('error', reject);



    doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827');

    doc.text('Relatório de Funcionários', { align: 'center' });

    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10).text('MotoRapido PLUS', { align: 'center' });

    doc.moveDown(0.5);

    doc.text(`Gerado em: ${now}`, { align: 'center' });

    doc.moveDown(1.2);

    resetPdfCursor(doc, MARGIN);



    if (employees.length === 0) {

      doc.fontSize(9).text('Nenhum registro encontrado.', { align: 'center' });

    } else {

      drawPdfTable({

        doc,

        columns: REPORT_COLUMNS,

        rows: employees.map(formatEmployeeRow),

        startX: MARGIN,

        fontSize: 5.5,

        headerFontSize: 6,

      });



      doc.moveDown(0.8);

      doc.fontSize(8).text(`Total de registros: ${employees.length}`, {

        align: 'right',

        width: doc.page.width - MARGIN * 2,

      });

    }



    addPdfPageFooters(doc, MARGIN);

    doc.end();

  });

};



export const generateEmployeesXlsx = async (

  filters?: EmployeeFilters

): Promise<Buffer> => {

  const employees = await getAllEmployees(filters);

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet('Funcionários');



  sheet.addRow(['MotoRapido PLUS']);

  sheet.addRow(['Relatório de Funcionários']);

  sheet.addRow([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);

  sheet.addRow([]);

  sheet.addRow(REPORT_HEADERS);



  const headerRow = sheet.getRow(5);

  headerRow.font = { bold: true };



  employees.forEach((employee) => {

    sheet.addRow(formatEmployeeRow(employee));

  });



  sheet.addRow([]);

  sheet.addRow([`Total de registros: ${employees.length}`]);



  sheet.columns.forEach((column) => {

    column.width = 18;

  });



  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);

};


