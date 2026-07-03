import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecret123_change_in_production';

export const generateToken = (payload: { id: string; role: string; username: string }) => {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET);
};
