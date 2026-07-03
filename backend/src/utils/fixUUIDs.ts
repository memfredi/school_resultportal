import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fixUUIDs() {
    console.log("Starting UUID cleanup for Notifications and AuditLogs...");

    // Resolve all programs
    const programs = await prisma.program.findMany({ include: { specialty: true } });
    const programMap = new Map();
    programs.forEach(p => {
        programMap.set(p.id, { programName: p.name, specialtyName: p.specialty.name });
    });

    console.log(`Loaded ${programs.length} programs for mapping.`);

    // 1. Fix AuditLogs
    const auditLogs = await prisma.auditLog.findMany();
    let auditFixed = 0;
    for (const log of auditLogs) {
        let updated = false;
        let pName = log.program;
        let sName = log.specialty;

        if (log.program && UUID_REGEX.test(log.program)) {
            const mapped = programMap.get(log.program);
            if (mapped) {
                pName = mapped.programName;
                if (!sName) {
                    sName = mapped.specialtyName;
                }
                updated = true;
            }
        }

        if (updated) {
            await prisma.auditLog.update({
                where: { id: log.id },
                data: {
                    program: pName,
                    specialty: sName
                }
            });
            auditFixed++;
        }
    }

    // 2. Fix Notifications
    const notifications = await prisma.notification.findMany();
    let notifsFixed = 0;
    for (const notif of notifications) {
        let updated = false;
        let msg = notif.message;
        let pName = notif.program;
        let sName = notif.specialty;

        // Try extracting UUID from message
        const match = msg.match(UUID_REGEX) || msg.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

        if (match) {
            const uuid = match[0];
            const mapped = programMap.get(uuid);
            if (mapped) {
                msg = msg.replace(uuid, mapped.programName);
                pName = mapped.programName;
                sName = mapped.specialtyName;
                updated = true;
            }
        } else if (notif.program && UUID_REGEX.test(notif.program)) {
            const mapped = programMap.get(notif.program);
            if (mapped) {
                pName = mapped.programName;
                sName = mapped.specialtyName;
                updated = true;
            }
        }

        if (updated) {
            await prisma.notification.update({
                where: { id: notif.id },
                data: {
                    message: msg,
                    program: pName,
                    specialty: sName
                }
            });
            notifsFixed++;
        }
    }

    console.log(`✅ Fixed ${auditFixed} AuditLogs`);
    console.log(`✅ Fixed ${notifsFixed} Notifications`);
}

fixUUIDs()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
