/**
 * Vercel Serverless Function Entry Point
 * This file adapts the Express app for Vercel's serverless environment
 */

import app from '../src/server';

// Export the Express app as a Vercel serverless function
export default app;

