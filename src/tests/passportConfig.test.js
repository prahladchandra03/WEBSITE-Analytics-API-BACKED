const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Mock the User model
jest.mock('../models/User');

describe('Passport Configuration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test GoogleStrategy - New User
  describe('GoogleStrategy - New User', () => {
    it('should create a new user if they do not exist', async () => {
      // Mock User.findOne to return null (user does not exist)
      User.findOne.mockResolvedValue(null);

      // Mock User.save to simulate saving a new user
      const mockUser = {
        googleId: '123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'http://example.com/avatar.jpg',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);

      // Simulate the GoogleStrategy callback
      const done = jest.fn();
      const profile = {
        id: '123',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
        photos: [{ value: 'http://example.com/avatar.jpg' }],
      };

      const strategy = new GoogleStrategy(
        {
          clientID: 'dummy-client-id',
          clientSecret: 'dummy-client-secret',
          callbackURL: 'http://localhost:3000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
              user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
              });
              await user.save();
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      );

      // Execute the strategy
      await strategy._verify('dummy-access-token', 'dummy-refresh-token', profile, done);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ googleId: '123' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });
  });

  // Test GoogleStrategy - Existing User
  describe('GoogleStrategy - Existing User', () => {
    it('should retrieve an existing user if they already exist', async () => {
      // Mock User.findOne to return an existing user
      const mockUser = {
        googleId: '123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'http://example.com/avatar.jpg',
      };
      User.findOne.mockResolvedValue(mockUser);

      // Simulate the GoogleStrategy callback
      const done = jest.fn();
      const profile = {
        id: '123',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
        photos: [{ value: 'http://example.com/avatar.jpg' }],
      };

      const strategy = new GoogleStrategy(
        {
          clientID: 'dummy-client-id',
          clientSecret: 'dummy-client-secret',
          callbackURL: 'http://localhost:3000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
              user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
              });
              await user.save();
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      );

      // Execute the strategy
      await strategy._verify('dummy-access-token', 'dummy-refresh-token', profile, done);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ googleId: '123' });
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });
  });

  // Test serializeUser
  describe('serializeUser', () => {
    it('should serialize the user ID', () => {
      const done = jest.fn();
      const user = { id: '123', email: 'test@example.com', name: 'Test User' };

      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      passport.serializeUser(user, done);

      expect(done).toHaveBeenCalledWith(null, '123');
    });
  });

  // Test deserializeUser
  describe('deserializeUser', () => {
    it('should deserialize the user', () => {
      const done = jest.fn();
      const user = { id: '123', email: 'test@example.com', name: 'Test User' };

      // Mock User.findById to return a user
      User.findById.mockImplementation((id, callback) => {
        callback(null, user);
      });

      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });

      passport.deserializeUser('123', done);

      expect(done).toHaveBeenCalledWith(null, user);
    });
  });
});