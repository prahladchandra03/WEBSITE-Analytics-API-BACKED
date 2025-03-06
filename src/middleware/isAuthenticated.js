// middleware/isAuthenticated.js
module.exports = (req, res, next) => {
    console.log("Headers: ", req.headers);
    console.log("Authorization Token: ", req.headers.authorization);
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
