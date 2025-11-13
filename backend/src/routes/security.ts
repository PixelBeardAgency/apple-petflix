import { Router, Request, Response } from 'express';
import { logger } from '../services/logger';

const router = Router();

/**
 * CSP Violation Report Endpoint
 * Receives and logs Content Security Policy violations
 */
router.post('/csp-report', (req: Request, res: Response) => {
  const report = req.body;
  
  logger.warn('CSP Violation Report', {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    timestamp: new Date().toISOString(),
  });

  res.status(204).end();
});

/**
 * Security.txt endpoint
 */
router.get('/.well-known/security.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`Contact: mailto:security@petflix.example.com
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://petflix.example.com/.well-known/security.txt

# Security Policy
If you discover a security vulnerability, please report it to us via email.
`);
});

export default router;

