import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Sanitize string input to prevent XSS
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .slice(0, 10000); // Limit length
};

// Validate YouTube URL
export const isValidYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validHosts = [
      'www.youtube.com',
      'youtube.com',
      'm.youtube.com',
      'youtu.be'
    ];
    
    return validHosts.includes(urlObj.hostname);
  } catch {
    return false;
  }
};

// Validate UUID format
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Validate YouTube video ID
export const isValidYouTubeVideoId = (id: string): boolean => {
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return videoIdRegex.test(id);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Validate username
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && password.length <= 128;
};

// Middleware to validate request body schema
export const validateBody = (schema: { [key: string]: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.body[key];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be a ${rules.type}`);
        continue;
      }

      // String validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} format is invalid`);
        }
        
        // Sanitize strings
        req.body[key] = sanitizeString(value);
      }

      // Number validations
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
        }
      }

      // Custom validators
      if (rules.validator && !rules.validator(value)) {
        errors.push(`${key} is invalid`);
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(', '), 400);
    }

    next();
  };
};

// Middleware to validate query parameters
export const validateQuery = (schema: { [key: string]: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.query[key];

      if (rules.required && !value) {
        errors.push(`${key} query parameter is required`);
        continue;
      }

      if (value && rules.type === 'number') {
        const num = parseInt(value as string, 10);
        if (isNaN(num)) {
          errors.push(`${key} must be a number`);
        } else {
          req.query[key] = num as any;
        }
      }

      if (value && rules.validator && !rules.validator(value)) {
        errors.push(`${key} is invalid`);
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(', '), 400);
    }

    next();
  };
};

// Middleware to validate URL parameters
export const validateParams = (schema: { [key: string]: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.params[key];

      if (rules.required && !value) {
        errors.push(`${key} parameter is required`);
        continue;
      }

      if (value && rules.validator && !rules.validator(value)) {
        errors.push(`${key} is invalid`);
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(', '), 400);
    }

    next();
  };
};

// Sanitize all string inputs in request body
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

// Prevent SQL injection in query strings
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/gi,
    /--/,
    /\/\*/,
    /xp_/gi,
  ];

  const checkString = (str: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(str));
  };

  // Check query parameters
  for (const key in req.query) {
    const value = req.query[key];
    if (typeof value === 'string' && checkString(value)) {
      throw new AppError('Invalid query parameter detected', 400);
    }
  }

  // Check body
  for (const key in req.body) {
    const value = req.body[key];
    if (typeof value === 'string' && checkString(value)) {
      throw new AppError('Invalid input detected', 400);
    }
  }

  next();
};

