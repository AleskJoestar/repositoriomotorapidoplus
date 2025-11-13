import 'express-session';

declare module 'express-serve-static-core' {
  interface Request {
    flash(type: string, message?: any): unknown[];
    addFlash(type: string, message: any): void;
    setOld(old: any): void;
    getOld<T = any>(): T;
    session: {
      flash?: { [key: string]: unknown[] };
      old?: any;
      [key: string]: any;
    };
  }
}
