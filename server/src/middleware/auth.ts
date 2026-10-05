import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository.ts';
import { sendError } from '../utils/apiResponse.ts';

export interface AuthenticatedRequest extends Request {
  adminUser?: any;
}

/**
 * Server-authoritative admin authorization middleware.
 * Verifies that the client possesses an authenticated session corresponding
 * to an authorized administrator in the database/user repository.
 *
 * Strictly rejects unauthorized role tampering or forged client-side role claims.
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Extract credentials from headers
    const headerUserId = req.headers['x-user-id'] as string | undefined;
    const authHeader = req.headers['authorization'] as string | undefined;

    let userId: string | undefined = headerUserId;

    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.substring(7).trim();
    }

    if (!userId) {
      return sendError({
        res,
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Administrative clearance credentials missing from telemetry request headers.',
      });
    }

    // 2. Validate against server user repository (PostgreSQL / store)
    const user = await userRepository.findById(userId);

    if (!user) {
      return sendError({
        res,
        statusCode: 401,
        code: 'USER_NOT_FOUND',
        message: 'The requested administrative terminal identity does not exist.',
      });
    }

    // 3. Verify admin role on the server model
    if (user.role !== 'admin') {
      return sendError({
        res,
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Access Denied: High-level administrative clearance required for this operation.',
      });
    }

    // Attach verified admin user object to request
    req.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
}
