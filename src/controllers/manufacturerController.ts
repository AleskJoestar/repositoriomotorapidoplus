import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  getAllManufacturers,
  createManufacturer,
  updateManufacturer,
  inactivateManufacturer,
  reactivateManufacturer,
  generateManufacturersPdf,
  generateManufacturersXml,
} from '@/services/manufacturerService';
import {
  createManufacturerSchema,
  updateManufacturerSchema,
} from '@/schemas/auxiliarySchema';

export const listManufacturersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await getAllManufacturers(req.query.includeInactive === 'true');
    res.status(200).json(items);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const createManufacturerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = createManufacturerSchema.parse(req.body);
    const item = await createManufacturer(data);
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

export const updateManufacturerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = updateManufacturerSchema.parse(req.body);
    const item = await updateManufacturer(id, data);
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

export const inactivateManufacturerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await inactivateManufacturer(id);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const reactivateManufacturerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await reactivateManufacturer(id);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const exportManufacturersPdfController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pdf = await generateManufacturersPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fabricantes-${Date.now()}.pdf"`
    );
    res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const exportManufacturersXmlController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const xml = await generateManufacturersXml();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fabricantes-${Date.now()}.xml"`
    );
    res.status(200).send(xml);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};
