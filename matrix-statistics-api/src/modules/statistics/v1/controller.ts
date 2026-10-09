import type { Request, Response } from "express";
import { responseError, responseSuccess } from "../../../shared/http/responses.ts";
import { messages } from "../../../shared/values/messages.ts";
import { QRMatricesSchema } from "./schemas.ts";
import * as service from "./service.ts";

/**
 * HTTP controller for computing QR matrix statistics.
 *
 * This function belongs to the Controller layer (HTTP). It assumes the request
 * body has been externally validated by a Zod schema. It receives the Express
 * request, delegates matrix processing to the service layer, and sends the
 * resulting JSON response using the unified helper `responseSuccess({ res, data })`.
 *
 * @param req - Express request object. Expects `req.body` to conform to
 *              `QRMatricesSchema`.
 * @param res - Express response object used to send the JSON response.
 * @returns A Promise that resolves once the response has been sent.
 *
 * @throws May propagate errors from the service layer if they occur during
 *         statistics computation. These errors are caught by the global error
 *         middleware (`errorMiddleware`) through the async wrapper
 *         (`wrapperAsyncFn`).
 */
export const calculateStatistics = async (req: Request, res: Response): Promise<void> => {
  const result = QRMatricesSchema.safeParse(req.body);

  if (!result.success) {
    console.log("Validation error:", result.error.issues);

    responseError({
      res,
      status: 400,
      message: messages.validationError
    });
    return;
  }

  const data = service.computeMatrixStats(result.data);

  responseSuccess({ res, data });
};
