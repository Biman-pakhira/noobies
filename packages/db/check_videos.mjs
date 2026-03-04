import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const videoCount = await prisma.video.count();
        const videos = await prisma.video.findMany({
            take: 5,
            select: { id: true, title: true, status: true }
        });
        console.log('Video Count:', videoCount);
        console.log('Recent Videos:', JSON.stringify(videos, null, 2));
    } catch (err) {
        console.error('Prisma Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
