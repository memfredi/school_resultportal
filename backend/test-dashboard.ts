import jwt from 'jsonwebtoken';
import fs from 'fs';
import { exec } from 'child_process';
import { PrismaClient } from '@prisma/client';

const run = async () => {
    const prisma = new PrismaClient();
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) return console.log('no admin user');

    // sign token like auth controller does
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
        { id: adminUser.id, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log("Got token:", token);

    exec(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/dashboard/stats`, (err, stdout, stderr) => {
        if (err) console.error(err);
        console.log("CURL Output:")
        console.log(stdout);
        prisma.$disconnect();
    });
}
run();
