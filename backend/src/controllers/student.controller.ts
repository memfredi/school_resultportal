import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStudentResults = async (req: Request, res: Response) => {
    try {
        const matricule = req.params.matricule as string;

        // Determine if the caller is a student
        // @ts-ignore
        const isStudent = req.user?.role === 'STUDENT';

        const results = await prisma.result.findMany({
            where: {
                matricule,
                ...(isStudent ? { status: 'PUBLISHED' } : {})
            },
            include: {
                program: {
                    include: { specialty: true }
                }
            },
            orderBy: { courseCode: 'asc' }
        });

        // Calculate average score
        let totalScore = 0;
        results.forEach((r: any) => totalScore += r.totalScore);
        const average = results.length ? (totalScore / results.length).toFixed(2) : '0';

        res.json({
            results,
            gpa: average,
            cgpa: average
        });

    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// Admin and teachers: bulk update result status for a program
export const updateBulkResultStatus = async (req: Request, res: Response) => {
    try {
        const { programId, status } = req.body;

        if (!programId || !status) {
            return res.status(400).json({ error: 'programId and status are required' });
        }

        const validStatuses = ['NOT_READY', 'READY_FOR_PUBLISHING', 'PUBLISHING', 'PUBLISHED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updated = await prisma.result.updateMany({
            where: { programId },
            data: { status }
        });

        const programRecord = await prisma.program.findUnique({
            where: { id: programId },
            include: { specialty: true }
        });
        const programName = programRecord ? programRecord.name : programId;
        const specialtyName = programRecord?.specialty ? programRecord.specialty.name : undefined;

        // Log notification
        await prisma.notification.create({
            data: {
                message: `Results for program ${programName} have been updated to status: ${status}`,
                status: 'SENT',
                program: programName,
                specialty: specialtyName
            }
        });

        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user?.id || 'system',
                action: `Updated results status to ${status}`,
                program: programName,
                specialty: specialtyName
            }
        });

        res.json({ message: `Updated ${updated.count} results to status ${status}` });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
