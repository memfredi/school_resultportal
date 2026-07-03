import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSpecialty = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const specialty = await prisma.specialty.create({
            data: { name },
        });

        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user?.id || 'system',
                action: 'Created Specialty',
                specialty: name
            }
        });

        res.status(201).json(specialty);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const getSpecialties = async (req: Request, res: Response) => {
    try {
        const specialties = await prisma.specialty.findMany({
            include: {
                programs: {
                    include: {
                        results: true,
                    }
                }
            }
        });

        const enriched = specialties.map((spec: any) => {
            let totalStudents = 0;
            let totalPassed = 0;
            let totalFailed = 0;

            const enrichedPrograms = spec.programs.map((prog: any) => {
                // Group results by unique student (matricule)
                const studentMap = new Map<string, any>();
                prog.results.forEach((res: any) => {
                    if (!studentMap.has(res.matricule)) {
                        studentMap.set(res.matricule, {
                            studentName: res.studentName,
                            matricule: res.matricule,
                            courses: [],
                            totalScore: 0,
                            status: res.status // Assume batch status maps to student overall roughly
                        });
                    }
                    const s = studentMap.get(res.matricule);
                    s.courses.push(res);
                    s.totalScore += res.totalScore;
                });

                const uniqueStudents = Array.from(studentMap.values());
                const programStudents = uniqueStudents.length;
                let programPassed = 0;
                let programFailed = 0;

                uniqueStudents.forEach((student) => {
                    const avg = student.totalScore / student.courses.length;
                    student.average = avg.toFixed(2);
                    if (avg >= 50) {
                        student.passed = true;
                        programPassed++;
                    } else {
                        student.passed = false;
                        programFailed++;
                    }
                });

                totalStudents += programStudents;
                totalPassed += programPassed;
                totalFailed += programFailed;

                return {
                    ...prog,
                    students: uniqueStudents,
                    stats: {
                        totalStudents: programStudents,
                        totalPassed: programPassed,
                        totalFailed: programFailed,
                        passRate: programStudents > 0 ? (programPassed / programStudents) * 100 : 0
                    }
                };
            });

            return {
                ...spec,
                programs: enrichedPrograms,
                stats: {
                    totalStudents,
                    totalPassed,
                    totalFailed,
                    passRate: totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0
                }
            };
        });

        res.json(enriched);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const createProgram = async (req: Request, res: Response) => {
    try {
        const specialtyId = req.params.specialtyId as string;
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Program name is required' });

        const program = await prisma.program.create({
            data: {
                name,
                specialtyId
            }
        });

        await prisma.auditLog.create({
            data: {
                // @ts-ignore
                userId: req.user?.id || 'system',
                action: 'Created Program',
                program: name
            }
        });

        res.status(201).json(program);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
