#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const crypto = require('crypto');

const email = process.env.ADMIN_SEED_EMAIL || process.argv[2];
const password = process.env.ADMIN_SEED_PASSWORD || process.argv[3];

if (!email || !password) {
    console.error('Usage: set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD environment variables or pass email password as arguments');
    console.error('Example (PowerShell):');
    console.error('$env:ADMIN_SEED_EMAIL="admin@example.com"; $env:ADMIN_SEED_PASSWORD="S3cureP@ss"; npm run seed:admin');
    process.exit(2);
}

const prisma = new PrismaClient();

(async () => {
    try {
        const existing = await prisma.adminUser.count();
        if (existing > 0) {
            console.error('Aborting: admin user(s) already exist in the database.');
            process.exit(1);
        }

        const id = crypto.randomUUID();
        const passwordHash = await argon2.hash(password);
        const user = await prisma.adminUser.create({
            data: { id, email, passwordHash, role: 'SuperAdmin', isActive: true },
        });

        console.log(`Created SuperAdmin: ${user.id} <${user.email}>`);
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();
