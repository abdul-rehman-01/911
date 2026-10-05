import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.ts';

export function notFoundHandler(req: Request, res: Response) {
  return sendError({
    res,
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist on the Car 911 telemetry cluster.`,
  });
}
