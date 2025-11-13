import { monitoringService, performanceMonitoring, getHealthStatus, getMetricsData } from '../monitoring';
import { Request, Response, NextFunction } from 'express';

describe('Monitoring Service', () => {
  beforeEach(() => {
    monitoringService.reset();
  });

  describe('monitoringService', () => {
    it('should track request metrics', () => {
      monitoringService.trackRequest({
        route: '/api/videos',
        method: 'GET',
        statusCode: 200,
        duration: 150,
        timestamp: new Date(),
        userId: 'user123',
      });

      const metrics = monitoringService.getSystemMetrics();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.avgResponseTime).toBe(150);
    });

    it('should track error requests', () => {
      monitoringService.trackRequest({
        route: '/api/videos',
        method: 'POST',
        statusCode: 400,
        duration: 50,
        timestamp: new Date(),
      });

      monitoringService.trackRequest({
        route: '/api/videos',
        method: 'GET',
        statusCode: 500,
        duration: 100,
        timestamp: new Date(),
      });

      const metrics = monitoringService.getSystemMetrics();
      expect(metrics.requestCount).toBe(2);
      expect(metrics.errorCount).toBe(2);
    });

    it('should calculate average response time', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 200,
        timestamp: new Date(),
      });

      const metrics = monitoringService.getSystemMetrics();
      expect(metrics.avgResponseTime).toBe(150);
    });

    it('should get metrics by route', () => {
      monitoringService.trackRequest({
        route: '/api/videos',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      monitoringService.trackRequest({
        route: '/api/users',
        method: 'GET',
        statusCode: 200,
        duration: 200,
        timestamp: new Date(),
      });

      const videoMetrics = monitoringService.getRouteMetrics('/api/videos');
      expect(videoMetrics).toHaveLength(1);
      expect(videoMetrics[0].route).toBe('/api/videos');
    });

    it('should detect slow requests', () => {
      monitoringService.trackRequest({
        route: '/api/slow',
        method: 'GET',
        statusCode: 200,
        duration: 2000,
        timestamp: new Date(),
      });

      const slowRequests = monitoringService.getSlowRequests(1000);
      expect(slowRequests).toHaveLength(1);
      expect(slowRequests[0].duration).toBe(2000);
    });

    it('should calculate error rate', () => {
      // Add 7 successful requests
      for (let i = 0; i < 7; i++) {
        monitoringService.trackRequest({
          route: '/api/test',
          method: 'GET',
          statusCode: 200,
          duration: 100,
          timestamp: new Date(),
        });
      }

      // Add 3 error requests
      for (let i = 0; i < 3; i++) {
        monitoringService.trackRequest({
          route: '/api/test',
          method: 'GET',
          statusCode: 500,
          duration: 100,
          timestamp: new Date(),
        });
      }

      const errorRate = monitoringService.getErrorRate();
      expect(errorRate).toBe(30); // 3/10 = 30%
    });

    it('should calculate average response time by route', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 300,
        timestamp: new Date(),
      });

      const avgTime = monitoringService.getAvgResponseTimeByRoute('/api/test');
      expect(avgTime).toBe(200);
    });

    it('should return 0 for routes with no metrics', () => {
      const avgTime = monitoringService.getAvgResponseTimeByRoute('/nonexistent');
      expect(avgTime).toBe(0);
    });

    it('should reset metrics', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      expect(monitoringService.getSystemMetrics().requestCount).toBe(1);

      monitoringService.reset();

      expect(monitoringService.getSystemMetrics().requestCount).toBe(0);
    });
  });

  describe('performanceMonitoring middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;
    let endSpy: jest.Mock;

    beforeEach(() => {
      mockReq = {
        route: { path: '/api/test' },
        path: '/api/test',
        method: 'GET',
      };
      
      endSpy = jest.fn(function (this: any, ...args: any[]) {
        return this;
      });

      mockRes = {
        statusCode: 200,
        end: endSpy,
      };
      
      nextFunction = jest.fn();
    });

    it('should track request performance', (done) => {
      performanceMonitoring(mockReq as Request, mockRes as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      
      // Simulate response end
      setTimeout(() => {
        endSpy.call(mockRes);
        
        const metrics = monitoringService.getSystemMetrics();
        expect(metrics.requestCount).toBeGreaterThan(0);
        
        done();
      }, 10);
    });

    it('should capture route information', (done) => {
      performanceMonitoring(mockReq as Request, mockRes as Response, nextFunction);
      
      setTimeout(() => {
        endSpy.call(mockRes);
        
        const routeMetrics = monitoringService.getRouteMetrics('/api/test');
        expect(routeMetrics.length).toBeGreaterThan(0);
        expect(routeMetrics[0].route).toBe('/api/test');
        
        done();
      }, 10);
    });

    it('should capture status codes', (done) => {
      mockRes.statusCode = 404;
      
      performanceMonitoring(mockReq as Request, mockRes as Response, nextFunction);
      
      setTimeout(() => {
        endSpy.call(mockRes);
        
        const metrics = monitoringService.getRouteMetrics('/api/test');
        expect(metrics[0].statusCode).toBe(404);
        
        done();
      }, 10);
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      const health = getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('memory');
      expect(health).toHaveProperty('requests');
      expect(health).toHaveProperty('performance');
      expect(health.requests.total).toBe(1);
    });

    it('should include memory usage', () => {
      const health = getHealthStatus();
      
      expect(health.memory).toHaveProperty('rss');
      expect(health.memory).toHaveProperty('heapTotal');
      expect(health.memory).toHaveProperty('heapUsed');
      expect(health.memory).toHaveProperty('external');
    });

    it('should calculate error rate', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 500,
        duration: 100,
        timestamp: new Date(),
      });

      const health = getHealthStatus();
      expect(health.requests.errorRate).toContain('%');
    });
  });

  describe('getMetricsData', () => {
    it('should return metrics data', () => {
      monitoringService.trackRequest({
        route: '/api/test',
        method: 'GET',
        statusCode: 200,
        duration: 100,
        timestamp: new Date(),
      });

      const metrics = getMetricsData();
      
      expect(metrics).toHaveProperty('system');
      expect(metrics).toHaveProperty('requests');
      expect(metrics).toHaveProperty('slowRequests');
      expect(metrics.requests.total).toBe(1);
    });

    it('should include slow requests', () => {
      monitoringService.trackRequest({
        route: '/api/slow',
        method: 'GET',
        statusCode: 200,
        duration: 2000,
        timestamp: new Date(),
      });

      const metrics = getMetricsData();
      expect(metrics.slowRequests.length).toBeGreaterThan(0);
    });
  });
});

