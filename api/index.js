/**
 * Vercel Serverless Function Entry Point
 * This file imports the built Express server
 */

const app = require('../backend/dist/server.js').default;

module.exports = app;

