const request = require('supertest');
const express = require('express');
const analyticsController = require('../controllers/analyticsController'); // Import the controller
const Event = require('../models/events'); // Import the Event model

// Mock the Event model
jest.mock('../models/events');

const app = express();
app.use(express.json());

// Routes for testing
app.post('/analytics/collect', analyticsController.collectEvent);
app.get('/analytics/event-summary', analyticsController.getEventSummary);
app.get('/analytics/user-stats', analyticsController.getUserStats);

describe('Analytics Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test POST /analytics/collect
  describe('POST /analytics/collect', () => {
    it('should record an event successfully', async () => {
      // Mock request body
      const eventData = {
        event: 'click',
        url: 'https://example.com',
        device: 'desktop',
        ipAddress: '127.0.0.1',
        userId: '123',
      };

      // Mock Event.save()
      const mockEvent = { ...eventData, appId: 'test-app-id', save: jest.fn().mockResolvedValue(true) };
      Event.mockImplementation(() => mockEvent);

      const response = await request(app)
        .post('/analytics/collect')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Event recorded successfully',
        event: mockEvent,
      });
    });

    it('should return a 400 error for missing required fields', async () => {
      const response = await request(app)
        .post('/analytics/collect')
        .send({ event: 'click' }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    it('should return a 500 error if saving the event fails', async () => {
      // Mock Event.save() to throw an error
      const mockEvent = { save: jest.fn().mockRejectedValue(new Error('Database error')) };
      Event.mockImplementation(() => mockEvent);

      const response = await request(app)
        .post('/analytics/collect')
        .send({
          event: 'click',
          url: 'https://example.com',
          device: 'desktop',
          ipAddress: '127.0.0.1',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
        error: 'Database error',
      });
    });
  });

  // Test GET /analytics/event-summary
  describe('GET /analytics/event-summary', () => {
    it('should return event summary data', async () => {
      // Mock query parameters
      const query = {
        event: 'click',
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      };

      // Mock Event.find()
      const mockEvents = [
        { event: 'click', userId: '123', device: 'desktop' },
        { event: 'click', userId: '456', device: 'mobile' },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/analytics/event-summary')
        .query(query);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        event: 'click',
        count: 2,
        uniqueUsers: 2,
        deviceData: { desktop: 1, mobile: 1 },
      });
    });

    it('should return a 400 error if the event parameter is missing', async () => {
      const response = await request(app)
        .get('/analytics/event-summary')
        .query({ startDate: '2023-10-01', endDate: '2023-10-31' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Event parameter is required' });
    });

    it('should return a 404 error if no events are found', async () => {
      // Mock Event.find() to return an empty array
      Event.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/analytics/event-summary')
        .query({ event: 'click' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'No events found for the given criteria',
      });
    });
  });

  // Test GET /analytics/user-stats
  describe('GET /analytics/user-stats', () => {
    it('should return user stats data', async () => {
      // Mock query parameters
      const query = { userId: '123' };

      // Mock Event.find()
      const mockEvents = [
        {
          userId: '123',
          metadata: { browser: 'Chrome', os: 'Windows' },
          ipAddress: '127.0.0.1',
        },
      ];
      Event.find.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/analytics/user-stats')
        .query(query);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userId: '123',
        totalEvents: 1,
        deviceDetails: { browser: 'Chrome', os: 'Windows' },
        ipAddress: '127.0.0.1',
      });
    });

    it('should return a 400 error if the userId parameter is missing', async () => {
      const response = await request(app).get('/analytics/user-stats');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'userId parameter is required' });
    });

    it('should return a 404 error if no events are found for the user', async () => {
      // Mock Event.find() to return an empty array
      Event.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/analytics/user-stats')
        .query({ userId: '123' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'No events found for the given user',
      });
    });
  });
});