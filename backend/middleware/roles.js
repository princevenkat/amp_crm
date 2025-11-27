// middleware/roles.js
export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({ message: "Unauthorized role" });
    };
};
