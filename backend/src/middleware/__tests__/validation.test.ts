import {
  sanitizeString,
  isValidYouTubeUrl,
  isValidUUID,
  isValidYouTubeVideoId,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  validateBody,
  validateQuery,
  validateParams,
  sanitizeBody,
  preventSQLInjection,
} from '../validation';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errorHandler';

describe('Validation Middleware', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove < and > characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should limit length to 10000 characters', () => {
      const longString = 'a'.repeat(20000);
      expect(sanitizeString(longString).length).toBe(10000);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeString(123 as any)).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('isValidYouTubeUrl', () => {
    it('should accept valid YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidYouTubeUrl('https://example.com')).toBe(false);
      expect(isValidYouTubeUrl('not a url')).toBe(false);
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should accept valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('12345')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidYouTubeVideoId', () => {
    it('should accept valid 11-character video IDs', () => {
      expect(isValidYouTubeVideoId('dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeVideoId('_-1234567890')).toBe(true);
    });

    it('should reject invalid video IDs', () => {
      expect(isValidYouTubeVideoId('short')).toBe(false);
      expect(isValidYouTubeVideoId('toolongvideoid')).toBe(false);
      expect(isValidYouTubeVideoId('has spaces!')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not an email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('a'.repeat(256) + '@example.com')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should accept valid usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('test_user-name')).toBe(true);
      expect(isValidUsername('abc')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false); // Too short
      expect(isValidUsername('a'.repeat(31))).toBe(false); // Too long
      expect(isValidUsername('user name')).toBe(false); // Contains space
      expect(isValidUsername('user@name')).toBe(false); // Invalid character
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('a'.repeat(8))).toBe(true);
      expect(isValidPassword('a'.repeat(128))).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(isValidPassword('short')).toBe(false); // Too short
      expect(isValidPassword('a'.repeat(129))).toBe(false); // Too long
    });
  });

  describe('validateBody middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockReq = { body: {} };
      mockRes = {};
      nextFunction = jest.fn();
    });

    it('should validate required fields', () => {
      mockReq.body = {};
      const middleware = validateBody({
        name: { required: true, type: 'string' },
      });

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should validate field types', () => {
      mockReq.body = { age: 'not a number' };
      const middleware = validateBody({
        age: { required: true, type: 'number' },
      });

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should validate string length', () => {
      mockReq.body = { name: 'ab' };
      const middleware = validateBody({
        name: { required: true, type: 'string', minLength: 3 },
      });

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should sanitize valid strings', () => {
      mockReq.body = { name: '  <script>test</script>  ' };
      const middleware = validateBody({
        name: { required: true, type: 'string' },
      });

      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockReq.body.name).toBe('scripttest/script');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow optional fields', () => {
      mockReq.body = {};
      const middleware = validateBody({
        optionalField: { required: false, type: 'string' },
      });

      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should use custom validators', () => {
      mockReq.body = { email: 'invalid-email' };
      const middleware = validateBody({
        email: { required: true, type: 'string', validator: isValidEmail },
      });

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });
  });

  describe('sanitizeBody middleware', () => {
    it('should sanitize all string fields', () => {
      const mockReq = {
        body: {
          name: '  <test>  ',
          age: 25,
          nested: { value: '<script>' },
        },
      } as Request;
      const mockRes = {} as Response;
      const nextFunction = jest.fn();

      sanitizeBody(mockReq, mockRes, nextFunction);

      expect(mockReq.body.name).toBe('test');
      expect(mockReq.body.age).toBe(25);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('preventSQLInjection middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockReq = { query: {}, body: {} };
      mockRes = {};
      nextFunction = jest.fn();
    });

    it('should detect SQL injection in query params', () => {
      mockReq.query = { name: 'test; DROP TABLE users;' };

      expect(() => {
        preventSQLInjection(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should detect SQL injection in body', () => {
      mockReq.body = { comment: 'test UNION SELECT * FROM passwords' };

      expect(() => {
        preventSQLInjection(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should detect SQL comments', () => {
      mockReq.body = { input: 'test -- comment' };

      expect(() => {
        preventSQLInjection(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow(AppError);
    });

    it('should allow safe inputs', () => {
      mockReq.query = { name: 'John Doe' };
      mockReq.body = { comment: 'This is a safe comment' };

      preventSQLInjection(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});

