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




const swaggerDocument = require("./swagger-output.json");

const path = require("path");
const fs = require("fs");
// Load environment variables

const swaggerFilePath = path.join(__dirname, "swagger-output.json");
if (!fs.existsSync(swaggerFilePath)) {
  console.error("swagger-output.json not found at:", swaggerFilePath);
  process.exit(1);
}

dotenv.config();

const app = express();

// Validate required environment variables
if (!process.env.SESSION_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Initialize Express app

app.use(express.json());
app.use(morgan("dev"));

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with frontend URL
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
  })
);

// Database connection
connectDB();

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
