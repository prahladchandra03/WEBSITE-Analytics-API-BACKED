const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token validation error: ", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

function generateToken(user) {
    // Ensure you are passing the correct payload and using your JWT_SECRET
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Token will expire in 1 hour
    });
}

module.exports = generateToken;
