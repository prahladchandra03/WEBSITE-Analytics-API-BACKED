const request = require('supertest');
const express = require('express');
const authController = require('../controllers/authController'); // Import the controller
const APIKey = require('../models/apiKey'); // Import the APIKey model
const generateApiKey = require('../utils/apiKeyGenerator'); // Import the API key generator

// Mock the APIKey model and generateApiKey utility
jest.mock('../models/apiKey');
jest.mock('../utils/apiKeyGenerator');

const app = express();
app.use(express.json());

// Routes for testing
app.get('/auth/google/callback', authController.googleCallback);
app.post('/auth/register-app', authController.registerApp);
app.get('/auth/api-key', authController.getApiKey);
app.post('/auth/revoke-api-key', authController.revokeApiKey);
app.get('/auth/failure', authController.authFailure);

describe('Auth Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test GET /auth/google/callback
  describe('GET /auth/google/callback', () => {
    it('should redirect to /api/auth/register-app after successful authentication', async () => {
      // Mock req.user
      const mockUser = { id: '123', email: 'test@example.com' };

      const response = await request(app)
        .get('/auth/google/callback')
        .set('user', mockUser); // Simulate authenticated user

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toBe('/api/auth/register-app');
    });
  });

  // Test POST /auth/register-app
  describe('POST /auth/register-app', () => {
    it('should register a new app and return an API key', async () => {
      // Mock request body
      const appData = {
        appName: 'Test App',
        appUrl: 'https://example.com',
      };

      // Mock APIKey.findOne() to return null (no existing app)
      APIKey.findOne.mockResolvedValue(null);

      // Mock generateApiKey to return a fake API key
      generateApiKey.mockReturnValue('fake-api-key');

      // Mock APIKey.save()
      const mockAPIKey = {
        ...appData,
        userId: '123',
        apiKey: 'fake-api-key',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        save: jest.fn().mockResolvedValue(true),
      };
      APIKey.mockImplementation(() => mockAPIKey);

      const response = await request(app)
        .post('/auth/register-app')
        .send(appData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ apiKey: 'fake-api-key' });
    });

    it('should return a 400 error if appName or appUrl is missing', async () => {
      const response = await request(app)
        .post('/auth/register-app')
        .send({ appName: 'Test App' }); // Missing appUrl

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'appName and appUrl are required' });
    });

    it('should return a 400 error if the app is already registered', async () => {
      // Mock APIKey.findOne() to return an existing app
      APIKey.findOne.mockResolvedValue({ appUrl: 'https://example.com' });

      const response = await request(app)
        .post('/auth/register-app')
        .send({ appName: 'Test App', appUrl: 'https://example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'App already registered' });
    });

    it('should return a 500 error if app registration fails', async () => {
      // Mock APIKey.findOne() to return null (no existing app)
      APIKey.findOne.mockResolvedValue(null);

      // Mock APIKey.save() to throw an error
      const mockAPIKey = { save: jest.fn().mockRejectedValue(new Error('Database error')) };
      APIKey.mockImplementation(() => mockAPIKey);

      const response = await request(app)
        .post('/auth/register-app')
        .send({ appName: 'Test App', appUrl: 'https://example.com' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error registering app',
        error: 'Database error',
      });
    });
  });

  // Test GET /auth/api-key
  describe('GET /auth/api-key', () => {
    it('should return the API key for the authenticated user', async () => {
      // Mock APIKey.findOne() to return an API key
      const mockAPIKey = { apiKey: 'fake-api-key' };
      APIKey.findOne.mockResolvedValue(mockAPIKey);

      const response = await request(app).get('/auth/api-key');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ apiKey: 'fake-api-key' });
    });

    it('should return a 404 error if no API key is found', async () => {
      // Mock APIKey.findOne() to return null
      APIKey.findOne.mockResolvedValue(null);

      const response = await request(app).get('/auth/api-key');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'API key not found' });
    });

    it('should return a 500 error if fetching the API key fails', async () => {
      // Mock APIKey.findOne() to throw an error
      APIKey.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/auth/api-key');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error fetching API key',
        error: 'Database error',
      });
    });
  });

  // Test POST /auth/revoke-api-key
  describe('POST /auth/revoke-api-key', () => {
    it('should revoke the API key successfully', async () => {
      // Mock APIKey.findOneAndDelete() to return a deleted key
      const mockDeletedKey = { apiKey: 'fake-api-key' };
      APIKey.findOneAndDelete.mockResolvedValue(mockDeletedKey);

      const response = await request(app)
        .post('/auth/revoke-api-key')
        .send({ apiKey: 'fake-api-key' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'API key revoked successfully' });
    });

    it('should return a 400 error if the API key is missing', async () => {
      const response = await request(app).post('/auth/revoke-api-key').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'API key is required' });
    });

    it('should return a 404 error if the API key is not found', async () => {
      // Mock APIKey.findOneAndDelete() to return null
      APIKey.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/revoke-api-key')
        .send({ apiKey: 'fake-api-key' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'API key not found' });
    });

    it('should return a 500 error if revoking the API key fails', async () => {
      // Mock APIKey.findOneAndDelete() to throw an error
      APIKey.findOneAndDelete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/revoke-api-key')
        .send({ apiKey: 'fake-api-key' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error revoking API key',
        error: 'Database error',
      });
    });
  });

  // Test GET /auth/failure
  describe('GET /auth/failure', () => {
    it('should return a 400 error for authentication failure', async () => {
      const response = await request(app).get('/auth/failure');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Google OAuth failed' });
    });
  });
});