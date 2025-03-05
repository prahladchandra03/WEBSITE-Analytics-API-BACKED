const authenticateApiKey = require('../middleware/authenticateApiKey');
const APIKey = require('../models/apiKey');

// Mock the APIKey model
jest.mock('../models/apiKey');

describe('authenticateApiKey Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // Test missing API key
  it('should return a 401 error if the API key is missing', async () => {
    await authenticateApiKey(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'API key is required' });
    expect(next).not.toHaveBeenCalled();
  });

  // Test invalid API key
  it('should return a 401 error if the API key is invalid', async () => {
    req.headers['x-api-key'] = 'invalid-api-key';

    // Mock APIKey.findOne to return null (invalid API key)
    APIKey.findOne.mockResolvedValue(null);

    await authenticateApiKey(req, res, next);

    expect(APIKey.findOne).toHaveBeenCalledWith({ apiKey: 'invalid-api-key' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid API key' });
    expect(next).not.toHaveBeenCalled();
  });

  // Test expired API key
  it('should return a 401 error if the API key has expired', async () => {
    req.headers['x-api-key'] = 'expired-api-key';

    // Mock APIKey.findOne to return an expired API key
    const expiredKey = {
      apiKey: 'expired-api-key',
      expiresAt: new Date('2023-01-01'), // Past date
    };
    APIKey.findOne.mockResolvedValue(expiredKey);

    await authenticateApiKey(req, res, next);

    expect(APIKey.findOne).toHaveBeenCalledWith({ apiKey: 'expired-api-key' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'API key has expired' });
    expect(next).not.toHaveBeenCalled();
  });

  // Test valid API key
  it('should attach appId to the request object and call next() for a valid API key', async () => {
    req.headers['x-api-key'] = 'valid-api-key';

    // Mock APIKey.findOne to return a valid API key
    const validKey = {
      apiKey: 'valid-api-key',
      expiresAt: new Date('2030-01-01'), // Future date
      appId: 'test-app-id',
    };
    APIKey.findOne.mockResolvedValue(validKey);

    await authenticateApiKey(req, res, next);

    expect(APIKey.findOne).toHaveBeenCalledWith({ apiKey: 'valid-api-key' });
    expect(req.appId).toBe('test-app-id'); // Verify appId is attached to the request
    expect(next).toHaveBeenCalled();
  });

  // Test internal server error
  it('should return a 500 error if an internal server error occurs', async () => {
    req.headers['x-api-key'] = 'valid-api-key';

    // Mock APIKey.findOne to throw an error
    APIKey.findOne.mockRejectedValue(new Error('Database error'));

    await authenticateApiKey(req, res, next);

    expect(APIKey.findOne).toHaveBeenCalledWith({ apiKey: 'valid-api-key' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
  });
});