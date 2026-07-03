import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalSpecialties = await prisma.specialty.count();
        const studentsCountAggregation = await prisma.result.groupBy({
            by: ['matricule'],
        });
        const totalStudents = studentsCountAggregation.length;

        const resultsReady = await prisma.program.count({
            where: {
                results: {
                    some: {
                        status: 'READY_FOR_PUBLISHING'
                    }
                }
            }
        });
        const resultsPublished = await prisma.result.count({ where: { status: 'PUBLISHED' } });

        const allResults = await prisma.result.findMany();
        let passed = 0;
        allResults.forEach((r: any) => {
            if (r.totalScore >= 50) passed++;
        });

        const passRate = allResults.length ? ((passed / allResults.length) * 100).toFixed(1) : 0;
        const failRate = allResults.length ? (100 - Number(passRate)).toFixed(1) : 0;

        res.json({
            totalSpecialties,
            totalStudents,
            resultsReady,
            resultsPublished,
            passRate: Number(passRate),
            failRate: Number(failRate)
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
