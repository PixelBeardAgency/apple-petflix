import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Performance monitoring service
 * Tracks request performance and system metrics
 */

interface PerformanceMetric {
  route: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userId?: string;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 metrics
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    
    // Clear old metrics every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * Track a request performance
   */
  trackRequest(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.requestCount++;
    this.totalResponseTime += metric.duration;

    if (metric.statusCode >= 400) {
      this.errorCount++;
    }

    // Enforce max metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow requests (> 1 second)
    if (metric.duration > 1000) {
      logger.warn(`Slow request detected: ${metric.method} ${metric.route} - ${metric.duration}ms`);
    }

    // Log errors
    if (metric.statusCode >= 500) {
      logger.error(`Server error: ${metric.method} ${metric.route} - Status ${metric.statusCode}`);
    }
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    return {
      uptime: (Date.now() - this.startTime.getTime()) / 1000, // in seconds
      memoryUsage: process.memoryUsage(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgResponseTime: this.requestCount > 0 
        ? this.totalResponseTime / this.requestCount 
        : 0,
    };
  }

  /**
   * Get performance metrics by route
   */
  getRouteMetrics(route?: string): PerformanceMetric[] {
    if (route) {
      return this.metrics.filter(m => m.route === route);
    }
    return this.metrics;
  }

  /**
   * Get slow requests (> threshold ms)
   */
  getSlowRequests(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * Get error rate
   */
  getErrorRate(): number {
    return this.requestCount > 0 
      ? (this.errorCount / this.requestCount) * 100 
      : 0;
  }

  /**
   * Get average response time by route
   */
  getAvgResponseTimeByRoute(route: string): number {
    const routeMetrics = this.metrics.filter(m => m.route === route);
    if (routeMetrics.length === 0) return 0;

    const total = routeMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / routeMetrics.length;
  }

  /**
   * Clean up old metrics
   */
  private cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = [];
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }
}

// Export singleton
export const monitoringService = new MonitoringService();

/**
 * Express middleware for performance monitoring
 */
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function (...args: any[]): any {
    const duration = Date.now() - startTime;

    monitoringService.trackRequest({
      route: req.route?.path || req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date(),
      userId: (req as any).user?.id,
    });

    return originalEnd(...args);
  };

  next();
};

/**
 * Health check endpoint data
 */
export const getHealthStatus = () => {
  const metrics = monitoringService.getSystemMetrics();
  const memoryUsageMB = {
    rss: Math.round(metrics.memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(metrics.memoryUsage.external / 1024 / 1024),
  };

  return {
    status: 'healthy',
    uptime: Math.round(metrics.uptime),
    timestamp: new Date().toISOString(),
    memory: memoryUsageMB,
    requests: {
      total: metrics.requestCount,
      errors: metrics.errorCount,
      errorRate: monitoringService.getErrorRate().toFixed(2) + '%',
    },
    performance: {
      avgResponseTime: Math.round(metrics.avgResponseTime) + 'ms',
    },
  };
};

/**
 * Metrics endpoint data
 */
export const getMetricsData = () => {
  const metrics = monitoringService.getSystemMetrics();
  const slowRequests = monitoringService.getSlowRequests();

  return {
    system: {
      uptime: Math.round(metrics.uptime),
      memory: metrics.memoryUsage,
    },
    requests: {
      total: metrics.requestCount,
      errors: metrics.errorCount,
      errorRate: monitoringService.getErrorRate(),
      avgResponseTime: metrics.avgResponseTime,
    },
    slowRequests: slowRequests.slice(-10), // Last 10 slow requests
  };
};

