import type { Response } from "express";

interface ResponseSuccessProps <T> {
  res: Response;
  data?: T;
  status?: number;
}

interface ResponseErrorProps {
  res: Response;
  message: string;
  status: number;
}


export const responseSuccess = <T>({
  res,
  data = undefined,
  status = 200
}: ResponseSuccessProps<T>) => {
  res.status(status).json({
    success: true,
    data
  });
};

export const responseError = ({
  res,
  message,
  status
}: ResponseErrorProps) => {
  res.status(status).json({
    success: false,
    message
  });
};
