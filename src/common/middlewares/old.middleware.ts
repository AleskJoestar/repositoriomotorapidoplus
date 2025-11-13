import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class OldMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Define helper to set old form data
    req.setOld = (old: any) => {
      if (!req.session) req.session = {} as any;
      req.session.old = old ?? {};
    };

    // Define helper to get old form data
    req.getOld = <T = any>(): T => {
      const data = (req.session && (req.session as any).old) || {};
      return data as T;
    };

    // Expose to templates
    res.locals.old = req.getOld();

    // Remove old session
    req.session.old = null;

    next();
  }
}
