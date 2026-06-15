import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const token = authHeader.substring(7); // Retirer 'Bearer ' du header
        req.user = jwt.verify(token, process.env.JWT_KEY);
        next();
    } catch {
        res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
}