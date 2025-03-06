// middleware/isAuthenticated.js
module.exports = (req, res, next) => {
    console.log("User in isAuthenticated middleware:", req.user); // Debug log
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
