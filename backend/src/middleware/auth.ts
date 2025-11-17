import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AppError } from './errorHandler';
import { logger } from '../services/logger';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    is_admin?: boolean;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`Auth middleware: ${req.method} ${req.path}`);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Auth middleware: No authorization token provided');
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7);
    logger.info('Auth middleware: Token found, verifying...');

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.error('Auth middleware: Token validation failed', error);
      throw new AppError('Invalid or expired token', 401);
    }

    logger.info(`Auth middleware: User authenticated - ${user.id}`);

    // Fetch user profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      is_admin: profile?.is_admin || false,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        // Fetch user profile for optional auth too
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        req.user = {
          id: user.id,
          email: user.email || '',
          is_admin: profile?.is_admin || false,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to require admin privileges
 * Must be used after authenticateUser
 */
export const requireAdmin = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!req.user.is_admin) {
      logger.warn(`Admin access denied for user: ${req.user.id}`);
      throw new AppError('Admin privileges required', 403);
    }

    logger.info(`Admin access granted for user: ${req.user.id}`);
    next();
  } catch (error) {
    next(error);
  }
};

