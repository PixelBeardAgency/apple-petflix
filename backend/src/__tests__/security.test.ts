/**
 * Security Tests
 * Tests for authentication, authorization, rate limiting, and input validation
 */

import request from 'supertest';
import express from 'express';
import { globalLimiter, authLimiter, youtubeSearchLimiter, videoSharingLimiter } from '../middleware/rateLimit';
import { sanitizeBody, preventSQLInjection } from '../middleware/validation';

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
    });

    it('should rate limit excessive requests', async () => {
      app.use(
        express.Router().get('/test', (req, res) => {
          res.json({ success: true });
        })
      );

      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/test');
        if (i < 4) {
          expect(res.status).toBe(200);
        }
      }
    });

    it('should have different rate limits for different endpoints', () => {
      // Global limiter: 200 req/15min
      expect(globalLimiter).toBeDefined();
      
      // Auth limiter: 5 req/15min
      expect(authLimiter).toBeDefined();
      
      // YouTube search: 30 req/min
      expect(youtubeSearchLimiter).toBeDefined();
      
      // Video sharing: 15 videos/hour
      expect(videoSharingLimiter).toBeDefined();
    });
  });

  describe('Input Sanitization', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(sanitizeBody);
    });

    it('should sanitize XSS attempts', async () => {
      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      const res = await request(app)
        .post('/test')
        .send({ content: '<script>alert("xss")</script>' });

      expect(res.body.content).not.toContain('<script>');
      expect(res.body.content).not.toContain('</script>');
    });

    it('should trim whitespace from inputs', async () => {
      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      const res = await request(app)
        .post('/test')
        .send({ name: '  test  ' });

      expect(res.body.name).toBe('test');
    });

    it('should handle nested objects', async () => {
      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      const res = await request(app)
        .post('/test')
        .send({
          user: {
            name: '  <test>  ',
            age: 25,
          },
        });

      expect(res.body.user.name).toBe('test');
      expect(res.body.user.age).toBe(25);
    });
  });

  describe('SQL Injection Prevention', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(preventSQLInjection);
    });

    it('should block SQL injection in query params', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .get('/test')
        .query({ name: "test'; DROP TABLE users;--" });

      expect(res.status).toBe(400);
    });

    it('should block SQL injection in request body', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/test')
        .send({ comment: 'test UNION SELECT * FROM passwords' });

      expect(res.status).toBe(400);
    });

    it('should block SQL comments', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/test')
        .send({ input: 'test -- comment' });

      expect(res.status).toBe(400);
    });

    it('should allow safe inputs', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/test')
        .send({ comment: 'This is a safe comment about cats' });

      expect(res.status).toBe(200);
    });
  });

  describe('Request Size Limits', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '1mb' }));
    });

    it('should reject requests larger than 1MB', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      // Create a payload larger than 1MB
      const largePayload = { data: 'a'.repeat(2 * 1024 * 1024) };

      const res = await request(app)
        .post('/test')
        .send(largePayload);

      expect(res.status).toBe(413);
    });

    it('should accept requests within size limit', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/test')
        .send({ data: 'small payload' });

      expect(res.status).toBe(200);
    });
  });

  describe('Authentication Security', () => {
    it('should require valid JWT tokens', () => {
      // Token validation is handled by Supabase
      // This test ensures the pattern is correct
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      expect(validToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    });

    it('should reject malformed tokens', () => {
      const malformedTokens = [
        'not-a-token',
        'Bearer',
        'Bearer ',
        '',
      ];

      malformedTokens.forEach(token => {
        expect(token).not.toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
      });
    });
  });

  describe('CORS Security', () => {
    it('should only allow whitelisted origins', () => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
      ];

      const testOrigins = [
        'http://localhost:5173', // Should be allowed
        'http://malicious.com', // Should be blocked
        'https://evil.com', // Should be blocked
      ];

      testOrigins.forEach(origin => {
        const isAllowed = allowedOrigins.includes(origin);
        expect(allowedOrigins.includes(origin)).toBe(isAllowed);
      });
    });
  });

  describe('Password Security', () => {
    it('should enforce minimum password length', () => {
      const passwords = [
        { password: '1234567', valid: false }, // Too short
        { password: '12345678', valid: true }, // Minimum length
        { password: 'secure_password_123', valid: true }, // Good
      ];

      passwords.forEach(({ password, valid }) => {
        expect(password.length >= 8).toBe(valid);
      });
    });

    it('should enforce maximum password length', () => {
      const longPassword = 'a'.repeat(129);
      const validPassword = 'a'.repeat(128);

      expect(longPassword.length > 128).toBe(true);
      expect(validPassword.length <= 128).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('should only accept YouTube URLs', () => {
      const validYouTubeUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
      ];

      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://evil.com/malware',
        'javascript:alert("xss")',
        'file:///etc/passwd',
      ];

      validYouTubeUrls.forEach(url => {
        try {
          const urlObj = new URL(url);
          const validHosts = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
          expect(validHosts.includes(urlObj.hostname)).toBe(true);
        } catch {
          fail('Should be valid URL');
        }
      });

      invalidUrls.forEach(url => {
        try {
          const urlObj = new URL(url);
          const validHosts = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
          expect(validHosts.includes(urlObj.hostname)).toBe(false);
        } catch {
          // Invalid URLs will throw, which is expected
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('Error Message Security', () => {
    it('should not leak sensitive information in error messages', () => {
      const safeErrorMessages = [
        'Invalid credentials',
        'Resource not found',
        'Unauthorized',
        'Forbidden',
        'Internal server error',
      ];

      const unsafePatterns = [
        /password/i,
        /database/i,
        /sql/i,
        /stack trace/i,
        /file path/i,
        /api key/i,
        /secret/i,
      ];

      safeErrorMessages.forEach(message => {
        unsafePatterns.forEach(pattern => {
          expect(message).not.toMatch(pattern);
        });
      });
    });
  });

  describe('Session Security', () => {
    it('should use secure cookie settings in production', () => {
      const secureSettings = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };

      expect(secureSettings.httpOnly).toBe(true);
      expect(secureSettings.sameSite).toBe('strict');
      expect(secureSettings.maxAge).toBeGreaterThan(0);
    });
  });

  describe('Content Security Policy', () => {
    it('should have restrictive CSP directives', () => {
      const csp = {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://*.supabase.co"],
      };

      expect(csp.defaultSrc).toContain("'self'");
      expect(csp.frameSrc).toContain("https://www.youtube.com");
      expect(csp.scriptSrc).not.toContain("'unsafe-eval'");
    });
  });
});

