import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository.ts';
import { validation } from '../schemas/validation.ts';
import { sendSuccess, sendError } from '../utils/apiResponse.ts';
import {
  generateAuthToken,
  hashPassword,
  verifyPassword,
  serializeSessionCookie,
  serializeClearSessionCookie,
} from '../utils/security.ts';
import { MOCK_USERS } from '../../../src/data/mockUsers.ts';
import { UserProfile } from '../models/index.ts';

// Known demo account credentials for verification
const DEMO_CREDENTIALS: Record<string, { pass: string; user: UserProfile }> = {
  [MOCK_USERS.admin.email.toLowerCase()]: {
    pass: 'AdminPass2026!',
    user: MOCK_USERS.admin,
  },
  [MOCK_USERS.member.email.toLowerCase()]: {
    pass: 'MemberPass2026!',
    user: MOCK_USERS.member,
  },
};

// In-memory credentials store for registered users during runtime
const REGISTERED_CREDENTIALS: Map<string, { hash: string; salt: string }> = new Map();

export const authController = {
  /**
   * Client authentication: Verifies passkey, establishes signed JWT & HTTP-only cookie.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const val = validation.validateLogin(req.body);
      if (!val.isValid) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: val.errors[0]?.message || 'Invalid credentials format.',
          details: val.errors,
        });
      }

      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      let authenticatedUser: UserProfile | null = null;

      // 1. Check Demo Accounts
      const demoAccount = DEMO_CREDENTIALS[email];
      if (demoAccount) {
        if (demoAccount.pass === password) {
          authenticatedUser = demoAccount.user;
        } else {
          return sendError({
            res,
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email terminal address or passkey.',
          });
        }
      } else {
        // 2. Lookup registered user and verify salted password
        const registeredCred = REGISTERED_CREDENTIALS.get(email);
        if (registeredCred) {
          const isValid = verifyPassword(password, registeredCred.hash, registeredCred.salt);
          if (!isValid) {
            return sendError({
              res,
              statusCode: 401,
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email terminal address or passkey.',
            });
          }
        }

        const found = await userRepository.findByEmail(email);
        if (found) {
          authenticatedUser = found;
        }
      }

      if (!authenticatedUser) {
        return sendError({
          res,
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email terminal address or passkey.',
        });
      }

      // 3. Issue signed JWT
      const token = generateAuthToken({
        sub: authenticatedUser.id,
        email: authenticatedUser.email,
        role: authenticatedUser.role === 'admin' ? 'admin' : 'user',
      });

      // 4. Attach HTTP-only session cookie
      res.setHeader('Set-Cookie', serializeSessionCookie(token));

      // 5. Respond with sanitized profile (never exposing password hash or secrets)
      return sendSuccess({
        res,
        message: 'Telemetry authentication successful.',
        data: {
          token,
          user: {
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            fullName: authenticatedUser.fullName,
            role: authenticatedUser.role,
            membershipTier: authenticatedUser.membershipTier,
            phone: authenticatedUser.phone,
            createdAt: authenticatedUser.createdAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * New member registration: Enforces password hashing, generates signed JWT.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const val = validation.validateRegister(req.body);
      if (!val.isValid) {
        return sendError({
          res,
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          message: val.errors[0]?.message || 'Registration validation failed.',
          details: val.errors,
        });
      }

      const email = req.body.email.trim().toLowerCase();
      const fullName = req.body.fullName.trim();
      const phone = req.body.phone?.trim() || '';
      const password = req.body.password;
      const membershipTier = req.body.membershipTier || 'Platinum';

      // Check if user already exists
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        return sendError({
          res,
          statusCode: 409,
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'An account with this email terminal already exists. Please authenticate.',
        });
      }

      // Hash password with salt
      const { hash: passwordHash, salt: passwordSalt } = hashPassword(password);
      REGISTERED_CREDENTIALS.set(email, { hash: passwordHash, salt: passwordSalt });

      const userId = `user-reg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const newUser: UserProfile = {
        id: userId,
        email,
        fullName,
        phone,
        role: 'user', // strictly non-admin
        membershipTier: ['Platinum', 'Track VIP', 'Private Collector'].includes(membershipTier)
          ? membershipTier
          : 'Platinum',
        savedVehiclesCount: 0,
        createdAt: new Date().toISOString(),
      };

      await userRepository.create(newUser);

      // Generate signed JWT
      const token = generateAuthToken({
        sub: newUser.id,
        email: newUser.email,
        role: 'user',
      });

      res.setHeader('Set-Cookie', serializeSessionCookie(token));

      return sendSuccess({
        res,
        statusCode: 201,
        message: 'Account successfully registered.',
        data: {
          token,
          user: newUser,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Current authenticated user profile
   */
  async me(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError({
          res,
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Not authenticated.',
        });
      }

      return sendSuccess({
        res,
        data: req.user,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout: Clears HTTP-only session cookie
   */
  async logout(_req: Request, res: Response) {
    res.setHeader('Set-Cookie', serializeClearSessionCookie());
    return sendSuccess({
      res,
      message: 'Session terminated. Clearance invalidated.',
    });
  },
};
