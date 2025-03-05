const request = require('supertest');
const express = require('express');
const passport = require('passport');
const authRoutes = require('../routes/authRoutes'); // Import the routes
const authController = require('../controllers/authController'); // Import the controller
const isAuthenticated = require('../middleware/isAuthenticated'); // Import the middleware
const { validateRegisterApp } = require('../middleware/validateInput'); // Import the middleware

// Mock the controller, middleware, and passport
jest.mock('../controllers/authController');
jest.mock('../middleware/isAuthenticated');
jest.mock('../middleware/validateInput');
jest.mock('passport');

const app = express();
app.use(express.json());
app.use(passport.initialize()); // Initialize passport
app.use('/auth', authRoutes); // Mount the authRoutes

describe('Auth Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock req.user for authenticated routes
    isAuthenticated.mockImplementation((req, res, next) => {
      req.user = { id: '123', _id: '123' }; // Add user details to the request object
      next();
    });

    // Mock passport.authenticate
    passport.authenticate.mockImplementation((strategy, options, callback) => (req, res, next) => {
      callback(null, { id: '123', email: 'test@example.com' }); // Simulate successful authentication
    });
  });

  // Test GET /auth/google/login
  describe('GET /auth/google/login', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app).get('/auth/google/login');

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toMatch(/accounts\.google\.com/); // Check if redirects to Google
    });
  });

  // Test GET /auth/google/callback
  describe('GET /auth/google/callback', () => {
    it('should handle Google OAuth callback successfully', async () => {
      // Mock authController.googleCallback
      authController.googleCallback.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Google OAuth successful' });
      });

      const response = await request(app).get('/auth/google/callback');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Google OAuth successful' });
    });

    it('should handle Google OAuth failure', async () => {
      // Mock passport.authenticate to simulate failure
      passport.authenticate.mockImplementation((strategy, options, callback) => (req, res, next) => {
        callback(new Error('OAuth failed'));
      });

      const response = await request(app).get('/auth/google/callback');

      expect(response.status).toBe(302); // Redirect to /auth/failure
      expect(response.header.location).toBe('/auth/failure');
    });
  });

  // Test POST /auth/register-app
  describe('POST /auth/register-app', () => {
    it('should register a new app with valid input', async () => {
      // Mock validateRegisterApp middleware
      validateRegisterApp.mockImplementation((req, res, next) => next());

      // Mock authController.registerApp
      authController.registerApp.mockImplementation((req, res) => {
        res.status(201).json({ apiKey: 'fake-api-key' });
      });

      const response = await request(app)
        .post('/auth/register-app')
        .send({ appName: 'Test App', appUrl: 'https://example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ apiKey: 'fake-api-key' });
    });

    it('should return a 400 error for missing required fields', async () => {
      // Mock validateRegisterApp to simulate validation error
      validateRegisterApp.mockImplementation((req, res, next) => {
        res.status(400).json({ message: 'appName and appUrl are required' });
      });

      const response = await request(app)
        .post('/auth/register-app')
        .send({ appName: 'Test App' }); // Missing appUrl

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'appName and appUrl are required' });
    });
  });

  // Test GET /auth/api-key
  describe('GET /auth/api-key', () => {
    it('should return the API key for the authenticated user', async () => {
      // Mock authController.getApiKey
      authController.getApiKey.mockImplementation((req, res) => {
        res.status(200).json({ apiKey: 'fake-api-key' });
      });

      const response = await request(app).get('/auth/api-key');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ apiKey: 'fake-api-key' });
    });

    it('should return a 404 error if no API key is found', async () => {
      // Mock authController.getApiKey to simulate no API key found
      authController.getApiKey.mockImplementation((req, res) => {
        res.status(404).json({ message: 'API key not found' });
      });

      const response = await request(app).get('/auth/api-key');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'API key not found' });
    });
  });

  // Test POST /auth/revoke-api-key
  describe('POST /auth/revoke-api-key', () => {
    it('should revoke the API key successfully', async () => {
      // Mock authController.revokeApiKey
      authController.revokeApiKey.mockImplementation((req, res) => {
        res.status(200).json({ message: 'API key revoked successfully' });
      });

      const response = await request(app)
        .post('/auth/revoke-api-key')
        .send({ apiKey: 'fake-api-key' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'API key revoked successfully' });
    });

    it('should return a 400 error if the API key is missing', async () => {
      // Mock authController.revokeApiKey to simulate missing API key
      authController.revokeApiKey.mockImplementation((req, res) => {
        res.status(400).json({ message: 'API key is required' });
      });

      const response = await request(app).post('/auth/revoke-api-key').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'API key is required' });
    });
  });

  // Test GET /auth/failure
  describe('GET /auth/failure', () => {
    it('should return a 400 error for authentication failure', async () => {
      // Mock authController.authFailure
      authController.authFailure.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Google OAuth failed' });
      });

      const response = await request(app).get('/auth/failure');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Google OAuth failed' });
    });
  });
});