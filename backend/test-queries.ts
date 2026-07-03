import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const totalSpecialties = await prisma.specialty.count();
    const totalPrograms = await prisma.program.count();

    const resultsReadyByProgram = await prisma.program.count({
        where: {
            results: {
                some: {
                    status: 'READY_FOR_PUBLISHING'
                }
            }
        }
    });

    const resultsReadyBySpecialty = await prisma.specialty.count({
        where: {
            programs: {
                some: {
                    results: {
                        some: {
                            status: 'READY_FOR_PUBLISHING'
                        }
                    }
                }
            }
        }
    });

    console.log("Total Specialties (DB):", totalSpecialties);
    console.log("Total Programs (DB):", totalPrograms);
    console.log("resultsReady By Program Query:", resultsReadyByProgram);
    console.log("resultsReady By Specialty Query:", resultsReadyBySpecialty);
}

main().catch(console.error).finally(() => prisma.$disconnect());
