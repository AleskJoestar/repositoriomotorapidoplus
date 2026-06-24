import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  createPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  reactivatePart,
  getPartAuditLogs,
} from '@/services/partService';
import {
  generatePartsPdf,
  generatePartsXlsx,
} from '@/services/partReportService';
import { createPartSchema, updatePartSchema } from '@/schemas/partSchema';
import { PartFilters } from '@/types';

const parsePartFilters = (query: Request['query']): PartFilters => ({
  category: query.category as string | undefined,
  manufacturer: query.manufacturer as string | undefined,
  status: query.status as string | undefined,
  lowStock: query.lowStock as string | undefined,
});

export const createPartController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const validatedData = createPartSchema.parse(req.body);
    const part = await createPart(validatedData, String(req.userId));

    res.status(201).json(part);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
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

export const getAllPartsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const parts = await getAllParts(parsePartFilters(req.query));
    res.status(200).json(parts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getPartByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;
    const part = await getPartById(id);

    if (!part) {
      res.status(404).json({ error: 'Peça não encontrada' });
      return;
    }

    res.status(200).json(part);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updatePartController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;
    const validatedData = updatePartSchema.parse(req.body);
    const part = await updatePart(id, validatedData, String(req.userId));

    res.status(200).json(part);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
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

export const deletePartController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;
    const result = await deletePart(id, String(req.userId));

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const reactivatePartController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;
    const part = await reactivatePart(id, String(req.userId));
    res.status(200).json(part);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getPartAuditLogsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;
    const logs = await getPartAuditLogs(id);

    res.status(200).json(logs);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportPartsPdfController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const pdf = await generatePartsPdf(parsePartFilters(req.query));
    const filename = `relatorio-pecas-${Date.now()}.pdf`;

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

export const exportPartsXlsxController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const xlsx = await generatePartsXlsx(parsePartFilters(req.query));
    const filename = `relatorio-pecas-${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(xlsx);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
