const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../routes/analyticsRoutes'); // Import the routes
const analyticsController = require('../controllers/analyticesController'); // Import the controller
const authenticateApiKey = require('../middleware/authenticateApiKey'); // Import the middleware

// Mock the controller and middleware
jest.mock('../controllers/analyticesController');
jest.mock('../middleware/authenticateApiKey');

const app = express();
app.use(express.json());
app.use('/analytics', analyticsRoutes); // Mount the analyticsRoutes

describe('Analytics Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test POST /analytics/collect
  describe('POST /analytics/collect', () => {
    it('should collect event data with a valid API key', async () => {
      // Mock authenticateApiKey middleware
      authenticateApiKey.mockImplementation((req, res, next) => {
        req.appId = 'test-app-id'; // Attach appId to the request
        next();
      });

      // Mock analyticsController.collectEvent
      analyticsController.collectEvent.mockImplementation((req, res) => {
        res.status(201).json({ message: 'Event recorded successfully' });
      });

      const response = await request(app)
        .post('/analytics/collect')
        .set('x-api-key', 'valid-api-key') // Simulate API key in headers
        .send({
          event: 'click',
          url: 'https://example.com',
          device: 'desktop',
          ipAddress: '127.0.0.1',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Event recorded successfully' });
    });

    it('should return a 401 error for an invalid API key', async () => {
      // Mock authenticateApiKey middleware to simulate unauthorized access
      authenticateApiKey.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Invalid API key' });
      });

      const response = await request(app)
        .post('/analytics/collect')
        .set('x-api-key', 'invalid-api-key') // Simulate invalid API key
        .send({
          event: 'click',
          url: 'https://example.com',
          device: 'desktop',
          ipAddress: '127.0.0.1',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid API key' });
    });
  });

  // Test GET /analytics/event-summary
  describe('GET /analytics/event-summary', () => {
    it('should return event summary data', async () => {
      // Mock authenticateApiKey middleware
      authenticateApiKey.mockImplementation((req, res, next) => {
        req.appId = 'test-app-id'; // Attach appId to the request
        next();
      });

      // Mock analyticsController.getEventSummary
      analyticsController.getEventSummary.mockImplementation((req, res) => {
        res.status(200).json({
          event: 'click',
          count: 10,
          uniqueUsers: 5,
          deviceData: { desktop: 7, mobile: 3 },
        });
      });

      const response = await request(app)
        .get('/analytics/event-summary')
        .set('x-api-key', 'valid-api-key') // Simulate API key in headers
        .query({ event: 'click', startDate: '2023-10-01', endDate: '2023-10-31' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        event: 'click',
        count: 10,
        uniqueUsers: 5,
        deviceData: { desktop: 7, mobile: 3 },
      });
    });

    it('should return a 401 error for an invalid API key', async () => {
      // Mock authenticateApiKey middleware to simulate unauthorized access
      authenticateApiKey.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Invalid API key' });
      });

      const response = await request(app)
        .get('/analytics/event-summary')
        .set('x-api-key', 'invalid-api-key') // Simulate invalid API key
        .query({ event: 'click' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid API key' });
    });
  });

  // Test GET /analytics/user-stats
  describe('GET /analytics/user-stats', () => {
    it('should return user stats data', async () => {
      // Mock authenticateApiKey middleware
      authenticateApiKey.mockImplementation((req, res, next) => {
        req.appId = 'test-app-id'; // Attach appId to the request
        next();
      });

      // Mock analyticsController.getUserStats
      analyticsController.getUserStats.mockImplementation((req, res) => {
        res.status(200).json({
          userId: '123',
          totalEvents: 15,
          deviceDetails: { browser: 'Chrome', os: 'Windows' },
          ipAddress: '127.0.0.1',
        });
      });

      const response = await request(app)
        .get('/analytics/user-stats')
        .set('x-api-key', 'valid-api-key') // Simulate API key in headers
        .query({ userId: '123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userId: '123',
        totalEvents: 15,
        deviceDetails: { browser: 'Chrome', os: 'Windows' },
        ipAddress: '127.0.0.1',
      });
    });

    it('should return a 401 error for an invalid API key', async () => {
      // Mock authenticateApiKey middleware to simulate unauthorized access
      authenticateApiKey.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Invalid API key' });
      });

      const response = await request(app)
        .get('/analytics/user-stats')
        .set('x-api-key', 'invalid-api-key') // Simulate invalid API key
        .query({ userId: '123' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid API key' });
    });
  });
});