import jwt from 'jsonwebtoken';
import db from '../mysql-connector.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Get user from the token and attach to request
            const [rows] = await db.query('SELECT * FROM team_members WHERE id = ?', [decoded.id]);
            const user = rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Exclude password from the user object attached to the request
            const { password, ...userWithoutPassword } = user;
            req.user = userWithoutPassword;

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check for Admin or Super Admin roles
export const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Super Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: requires admin privileges.' });
    }
};
