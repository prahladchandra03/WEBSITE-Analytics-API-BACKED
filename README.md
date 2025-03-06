<<<<<<< HEAD
# website-analytics-api
# Website Analytics API

This project is a Website Analytics API that handles user authentication via Google OAuth and provides endpoints for managing API keys and analytics data.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/website-analytics-api.git
    cd website-analytics-api
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    JWT_SECRET=your-jwt-secret
    MONGO_URI=your-mongodb-uri
    SESSION_SECRET=your-session-secret
    REDIS_URL=your-redis-url
    ```

2. Update the `swagger-output.json` file with your actual host and base URL if necessary.

## Running the Application

1. Generate the Swagger documentation:

    ```sh
    npm run generate-swagger
    ```

2. Start the application:

    ```sh
    npm start
    ```

    The server will start on the port specified in the [.env](http://_vscodecontentref_/1) file or default to port 3000.

## API Endpoints

### Authentication

- **Google OAuth Login**
  - `GET /api/auth/google/login`
  - Redirects to Google OAuth for authentication.

- **Google OAuth Callback**
  - `GET /api/auth/google/callback`
  - Handles the callback from Google OAuth.

- **Register App**
  - `POST /api/auth/registerApp`
  - Registers a new app and generates an API key.
  - Request body:
    ```json
    {
      "appName": "Your App Name",
      "appUrl": "https://yourapp.com"
    }
    ```

- **Get API Key**
  - `GET /api/auth/getApiKey`
  - Retrieves the API key for the authenticated user.

- **Revoke API Key**
  - `POST /api/auth/revokeApiKey`
  - Revokes an existing API key.
  - Request :
body    ```json
    {
      "apiKey": "your-api-key"
    }
    ```

### Analytics

- **Collect Event**
  - `POST /api/analytics/collect`
  - Collects an analytics event.
  - Request body:
    ```json
    {
      "event": "click",
      "url": "https://example.com",
      "referrer": "https://referrer.com",
      "device": "desktop",
      "ipAddress": "127.0.0.1",
      "timestamp": "2023-10-01T00:00:00Z",
      "metadata": {
        "browser": "Chrome",
        "os": "Windows",
        "screenSize": "1920x1080"
      },
      "userId": "user-id"
    }
    ```

- **Get Event Summary**
  - `GET /api/analytics/event-summary`
  - Retrieves a summary of events.
  - Query parameters:
    - `event`: The event type (required)
    - `startDate`: The start date for the summary (optional)
    - `endDate`: The end date for the summary (optional)
    - `app_id`: The app ID (optional)

- **Get User Stats**
  - `GET /api/analytics/user-stats`
  - Retrieves statistics for a specific user.
  - Query parameters:
    - `userId`: The user ID (required)

## Testing

1. Run the tests:

    ```sh
    npm test
    ```

    This will run the tests using Jest and output the results.

## License

This project is licensed under the MIT License.
=======
# WEBSITE-Analytics-API-BACKED
>>>>>>> origin/master
