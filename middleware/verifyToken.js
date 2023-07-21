const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the token
    jwt.verify(token, `${process.env.ACCESS_TOKEN}`, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Add the decoded token data to the request object

        req.userId = decoded.email ? decoded.email : decoded.address;
        next();
    });
}
module.exports = verifyToken
