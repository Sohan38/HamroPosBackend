import prisma from './client';

async function main() {
    await prisma.feature.upsert({
        where: { id: 'inventory.batches' },
        update: {},
        create: {
            id: 'inventory.batches',
            name: 'Inventory Batches',
            valueType: 'boolean',
            description: 'Enable inventory batch tracking',
        },
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
