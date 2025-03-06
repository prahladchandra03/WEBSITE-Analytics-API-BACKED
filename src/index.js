const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const MongoStore = require("connect-mongo");
const analyticsRoutes = require("./routes/analyticsRoutes");
const connectDB = require("./utils/db");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

dotenv.config();

// Load Swagger document
const swaggerFilePath = path.join(__dirname, "swagger-output.json");
if (!fs.existsSync(swaggerFilePath)) {
  console.error("swagger-output.json not found at:", swaggerFilePath);
  process.exit(1);
}
const swaggerDocument = require(swaggerFilePath);

// Validate required environment variables
if (!process.env.SESSION_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(morgan("dev"));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // Development URL
  "https://website-analytics-api-1.onrender.com", // Production URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow undefined origins (like Postman or browser extensions) during development
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
  })
);

// Connect to the database
connectDB();

// Swagger documentation route

const swaggerOptions = {
  swaggerOptions: {
    url: process.env.SWAGGER_BASE_URL  // Use env var or default
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));


// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Initialize Passport
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);
app.use("/api", analyticsRoutes);

// Centralized error handling
app.use(errorHandler);

// Fallback for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
