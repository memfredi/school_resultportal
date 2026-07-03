import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // pagination could be implemented here
        });
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
