import { Request, Response } from 'express';
import {
  getCurrentSale,
  addCartItem,
  removeCartItem,
  checkoutSale,
  getSalesReport,
} from '@/services/saleService';
import { generateSalesPdf, generateSalesXml } from '@/services/saleReportService';
import { SaleFilters } from '@/types/sale';
import {
  addCartItemSchema,
  removeCartItemSchema,
  checkoutSchema,
} from '@/schemas/saleSchema';
import { ZodError } from 'zod';
import { resolveUserAccessType } from '@/middleware/requirePdvAccess';

const parseSaleFilters = (query: Request['query']): SaleFilters => ({
  dateFrom: typeof query.dateFrom === 'string' ? query.dateFrom : undefined,
  dateTo: typeof query.dateTo === 'string' ? query.dateTo : undefined,
  timeFrom: typeof query.timeFrom === 'string' ? query.timeFrom : undefined,
  timeTo: typeof query.timeTo === 'string' ? query.timeTo : undefined,
});

export const getCurrentSaleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const sale = await getCurrentSale(Number(req.userId));
    res.status(200).json(sale ?? null);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const addCartItemController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const data = addCartItemSchema.parse(req.body);
    const sale = await addCartItem(Number(req.userId), data);
    res.status(200).json(sale);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Dados inválidos' });
      return;
    }
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const removeCartItemController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const partId = parseInt(req.params.partId, 10);
    if (Number.isNaN(partId)) {
      res.status(400).json({ error: 'Produto inválido' });
      return;
    }

    const accessType = await resolveUserAccessType(req);
    if (!accessType) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const body = removeCartItemSchema.parse(req.body ?? {});
    const sale = await removeCartItem(
      Number(req.userId),
      partId,
      accessType,
      body.masterEmail && body.masterSenha
        ? { email: body.masterEmail, senha: body.masterSenha }
        : undefined
    );

    res.status(200).json(sale);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Dados inválidos' });
      return;
    }
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const checkoutSaleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const data = checkoutSchema.parse(req.body);
    const sale = await checkoutSale(Number(req.userId), {
      paymentMethod: data.paymentMethod as 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO',
      amountPaid: data.amountPaid,
    });

    res.status(200).json(sale);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Dados inválidos' });
      return;
    }
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getSalesReportController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const sales = await getSalesReport(parseSaleFilters(req.query));
    res.status(200).json(
      sales.map((sale) => ({
        ...sale,
        soldAt: sale.soldAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportSalesPdfController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const pdf = await generateSalesPdf(parseSaleFilters(req.query));
    const filename = `relatorio-vendas-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportSalesXmlController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const xml = await generateSalesXml(parseSaleFilters(req.query));
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-vendas-${Date.now()}.xml"`
    );
    res.status(200).send(xml);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
