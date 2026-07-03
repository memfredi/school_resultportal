import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
