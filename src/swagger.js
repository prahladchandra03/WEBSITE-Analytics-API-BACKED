const swaggerAutogen = require("swagger-autogen")();

// Swagger document configuration
const doc = {
  info: {
    title: "My API",
    description: "API documentation for My Application",
  },
  host: "https://website-analytics-api-1.onrender.com", // Update this to your actual host
  schemes: ["https"], // Use 'https' in production
  basePath: "/api", // Base path for your API
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    // Define security schemes (e.g., JWT, OAuth2)
    BearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter your cookiee in the format `cooke(id) <value>`",
    },
  },
};

// Output file for Swagger documentation
const outputFile = "./swagger-output.json"; // Corrected path

// Paths to your route files
const routes = [
  "./routes/authRoutes.js", // Update this path
  "./routes/analyticsRoutes.js", // Update this path
];

// Generate Swagger documentation
swaggerAutogen(outputFile, routes, doc);
