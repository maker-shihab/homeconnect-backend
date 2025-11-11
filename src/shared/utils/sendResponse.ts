import { Response } from 'express';

interface IApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string | null;
  data: T | null;
  meta?: IApiMeta;
}

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string | null,
  data: T | null,
  meta?: IApiMeta
): void => {

  const success = statusCode >= 200 && statusCode < 300;

  const responseData: IApiResponse<T> = {
    statusCode,
    success,
    message: message || null,
    data: data || null,
  };

  if (meta) {
    responseData.meta = meta;
  }

  res.status(statusCode).json(responseData);
};

export default sendResponse;