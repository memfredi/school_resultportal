import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const specialtiesData = [
    { name: 'BTECH', programs: ['CSE Cloud', 'MEC', 'EEE'], prefix: ['CSE', 'MEC', 'EEE'] },
    { name: 'BSC', programs: ['MIS', 'SWE'], prefix: ['MIS', 'SWE'] }
];

const courseDatabase = [
    { code: 'MATH101', name: 'Engineering Mathematics' },
    { code: 'PHY101', name: 'Physics I' },
    { code: 'ENG101', name: 'Communication Skills' },
    { code: 'CF101', name: 'Computer Fundamentals' },
    { code: 'PRG101', name: 'Intro to Programming' },
    { code: 'DB101', name: 'Intro to Databases' },
];

async function main() {
    console.log("Cleaning up old data...");
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.result.deleteMany();
    await prisma.user.deleteMany();
    await prisma.program.deleteMany();
    await prisma.specialty.deleteMany();

    console.log("Seeding Admin...");
    const adminPwd = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: { username: 'admin', password: adminPwd, role: 'ADMIN' }
    });

    console.log("Seeding 25 Students and Results Data...");
    const studentPwd = await bcrypt.hash('password123', 10);

    for (const s of specialtiesData) {
        const specialty = await prisma.specialty.create({
            data: { name: s.name }
        });

        for (let i = 0; i < s.programs.length; i++) {
            const progName = s.programs[i];
            const prefix = s.prefix[i];

            const program = await prisma.program.create({
                data: { name: progName, specialtyId: specialty.id }
            });

            for (let num = 1; num <= 5; num++) {
                const matricule = `${prefix}0${num}`; // e.g. CSE01, CSE02

                await prisma.user.create({
                    data: { username: matricule, password: studentPwd, role: 'STUDENT' }
                });

                // 6 Courses
                for (const course of courseDatabase) {
                    const ca = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
                    const exam = Math.floor(Math.random() * (70 - 30 + 1)) + 30;
                    const total = ca + exam;
                    let grade = 'F';
                    if (total >= 80) grade = 'A';
                    else if (total >= 70) grade = 'B';
                    else if (total >= 60) grade = 'C';
                    else if (total >= 50) grade = 'D';

                    await prisma.result.create({
                        data: {
                            studentName: `Student ${num} of ${progName}`,
                            matricule,
                            courseCode: course.code,
                            courseName: course.name,
                            caScore: ca,
                            examScore: exam,
                            totalScore: total,
                            grade,
                            status: 'READY_FOR_PUBLISHING',
                            academicYear: '2024/2025',
                            semester: 1,
                            programId: program.id
                        }
                    });
                }
            }
        }
    }

    // Create notifications mock
    await prisma.notification.create({
        data: { message: "25 students' results are waiting for publication in various programs.", status: "PENDING" }
    });

    console.log("Database Seeded Successfully! Use 'password123' to login as students (CSE01, MEC01, SWE01, etc.)");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
