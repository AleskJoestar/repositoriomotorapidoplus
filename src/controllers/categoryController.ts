import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  inactivateCategory,
  reactivateCategory,
  generateCategoriesPdf,
  generateCategoriesXml,
} from '@/services/categoryService';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/schemas/auxiliarySchema';

export const listCategoriesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await getAllCategories(req.query.includeInactive === 'true');
    res.status(200).json(items);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const createCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = createCategorySchema.parse(req.body);
    const item = await createCategory(data);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = updateCategorySchema.parse(req.body);
    const item = await updateCategory(id, data);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const inactivateCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await inactivateCategory(id);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const reactivateCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await reactivateCategory(id);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const exportCategoriesPdfController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pdf = await generateCategoriesPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="categorias-${Date.now()}.pdf"`
    );
    res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const exportCategoriesXmlController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const xml = await generateCategoriesXml();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="categorias-${Date.now()}.xml"`
    );
    res.status(200).send(xml);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};
