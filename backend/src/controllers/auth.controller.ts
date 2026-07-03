import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({
            id: user.id,
            role: user.role,
            username: user.username
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, username: true, role: true }
        });

        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(dbUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
