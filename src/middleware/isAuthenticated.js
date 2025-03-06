const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Authorization Header:", req.headers.authorization); // Extract the token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using your JWT secret
        req.user = decoded; // Attach decoded user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Token validation error: ", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Function to generate JWT token
const generateToken = (user) => {
    // Ensure you are passing the correct payload and using your JWT_SECRET
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token will expire in 1 hour
    });
};

module.exports = { isAuthenticated, generateToken };

