const { validateRegisterApp } = require('../middleware/validateInput');
const { body, validationResult } = require('express-validator');

describe('validateRegisterApp Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // Test missing appName
  it('should return a 400 error if appName is missing', async () => {
    req.body = { appUrl: 'https://example.com' };

    // Run the validation middleware
    await validateRegisterApp[0](req, res, next);
    await validateRegisterApp[1](req, res, next);
    await validateRegisterApp[2](req, res, next);

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({ msg: 'appName is required' }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Test invalid appUrl
  it('should return a 400 error if appUrl is invalid', async () => {
    req.body = { appName: 'Test App', appUrl: 'invalid-url' };

    // Run the validation middleware
    await validateRegisterApp[0](req, res, next);
    await validateRegisterApp[1](req, res, next);
    await validateRegisterApp[2](req, res, next);

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({ msg: 'appUrl must be a valid URL' }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Test valid input
  it('should call next() if appName and appUrl are valid', async () => {
    req.body = { appName: 'Test App', appUrl: 'https://example.com' };

    // Run the validation middleware
    await validateRegisterApp[0](req, res, next);
    await validateRegisterApp[1](req, res, next);
    await validateRegisterApp[2](req, res, next);

    // Verify next() is called
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});