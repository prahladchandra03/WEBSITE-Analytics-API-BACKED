const errorHandler = require('../middleware/errorHandler');

describe('errorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Mock console.error to suppress logs during testing
    console.error = jest.fn();
  });

  it('should log the error and return a 500 response with the error message', () => {
    const err = new Error('Test error');

    errorHandler(err, req, res, next);

    // Verify the error is logged
    expect(console.error).toHaveBeenCalledWith(err.stack);

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error',
      error: 'Test error',
    });
  });
});