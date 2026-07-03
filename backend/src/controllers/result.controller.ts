import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import results manually or via bulk
export const importResults = async (req: Request, res: Response) => {
    try {
        const { programId, results, academicYear, semester } = req.body;

        // In a real app we would parse CSV/Excel directly here using multer
        // For now we assume frontend parses it and sends JSON array
        if (!results || !Array.isArray(results)) {
            return res.status(400).json({ error: 'Invalid results format' });
        }

        let successCount = 0;
        let failedCount = 0;

        for (const record of results) {
            try {
                await prisma.result.upsert({
                    where: {
                        matricule_courseCode_academicYear_semester: {
                            matricule: record.matricule,
                            courseCode: record.courseCode,
                            academicYear,
                            semester
                        }
                    },
                    update: {
                        caScore: record.caScore,
                        examScore: record.examScore,
                        totalScore: record.caScore + record.examScore,
                        grade: record.grade,
                        status: 'NOT_READY'
                    },
                    create: {
                        studentName: record.studentName,
                        matricule: record.matricule,
                        courseCode: record.courseCode,
                        courseName: record.courseName,
                        caScore: record.caScore,
                        examScore: record.examScore,
                        totalScore: record.caScore + record.examScore,
                        grade: record.grade,
                        status: 'NOT_READY',
                        academicYear,
                        semester,
                        programId,
                    }
                });
                successCount++;
            } catch (err) {
                failedCount++;
            }
        }

        const programRecord = await prisma.program.findUnique({
            where: { id: programId },
            include: { specialty: true }
        });
        const programName = programRecord ? programRecord.name : programId;
        const specialtyName = programRecord?.specialty ? programRecord.specialty.name : undefined;

        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user?.id || 'system',
                action: 'Imported Results',
                program: programName,
                specialty: specialtyName
            }
        });

        res.json({ message: 'Import completed', successCount, failedCount });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const getResultsByProgram = async (req: Request, res: Response) => {
    try {
        const programId = req.params.programId as string;
        const results = await prisma.result.findMany({
            where: { programId }
        });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateResultStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        const result = await prisma.result.update({
            where: { id },
            data: { status }
        });

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
