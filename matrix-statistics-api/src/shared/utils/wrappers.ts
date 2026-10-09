import type { NextFunction, Request, Response } from "express";

export const wrapperAsyncFn = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch((err: unknown) => next(err));
  };
};
