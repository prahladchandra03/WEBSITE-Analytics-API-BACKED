const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Website Analytics API",
    description:
      "API documentation for the Website Analytics Application. This API handles user authentication via Google OAuth and provides endpoints for managing API keys and analytics data.",
    version: "1.0.0",
  },
  host: "website-analytics-api-1.onrender.com", // Update this to your actual host
  schemes: ["https"], // Use 'https' in production
  basePath: "/api", // Base path for your API
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter JWT token in the format 'Bearer <your-token>'",
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "Endpoints for user authentication and API key management",
    },
    {
      name: "Analytics",
      description: "Endpoints for collecting and retrieving analytics data",
    },
  ],
};

const outputFile = "./swagger-output.json"; // Output file for Swagger documentation
const routes = [
  "./routes/authRoutes.js", // Path to your auth routes
  "./routes/analyticsRoutes.js", // Path to your analytics routes
];

// Generate Swagger documentation
swaggerAutogen(outputFile, routes, doc);
