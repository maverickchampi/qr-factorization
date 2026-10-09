import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { messages } from "../values/messages.ts";
import { CustomError } from "./errors.ts";
import { responseError } from "./responses.ts";

/**
 * JWT-based authentication middleware.
 *
 * This function belongs to the Security Middleware layer. It securely extracts
 * the Bearer token from the `Authorization` header, validates it against
 * `process.env.JWT_SECRET`, and handles errors by calling
 * `next(new CustomError(...))`.
 *
 * The token must be provided in the format `Bearer <token>`. If the token is
 * missing, invalid, empty, or if `JWT_SECRET` is not defined, an authentication
 * error with HTTP status 401 (`INVALID_SESSION`) is generated.
 *
 * @param req - Express request object from which the `Authorization` header
 *              is extracted.
 * @param _res - Express response object (not used in this middleware).
 * @param next - Express `next` function to proceed to the next middleware
 *               or controller.
 *
 * @throws Implicitly throws `CustomError` with status 401 when authentication
 *         fails. These errors are passed to `next(...)` for handling by the
 *         global error middleware.
 */
export const authenticateMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError({ status: 401, message: messages.invalidSession });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.JWT_SECRET) {
      throw new CustomError({ status: 401, message: messages.invalidSession });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch {
    next(new CustomError({ status: 401, message: messages.invalidSession }));
  }
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof CustomError) {
    responseError({
      res,
      status: error.status,
      message: error.message
    });
    return;
  }

  console.error(error);

  responseError({
    res,
    status: 500,
    message: messages.error
  });
};
