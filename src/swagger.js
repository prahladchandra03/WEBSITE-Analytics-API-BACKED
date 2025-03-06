const swaggerAutogen = require("swagger-autogen")();

// Swagger document configuration
const doc = {
  info: {
    title: "My API",
    description: "API documentation for My Application. This API handles user authentication via Google OAuth and provides endpoints for managing API keys and analytics data.",
    version: "1.0.0",
  },
  host: "website-analytics-api-1.onrender.com", // Update this to your actual host
  schemes: ["https"], // Use 'https' in production
  basePath: "/api", // Base path for your API
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
   
  },
};

// Output file for Swagger documentation
const outputFile = "./swagger-output.json"; // Corrected path

// Paths to your route files
const routes = [
  "./routes/authRoutes.js", // Path to your auth routes
  "./routes/analyticsRoutes.js", // Path to your analytics routes
];

// Generate Swagger documentation
swaggerAutogen(outputFile, routes, doc);