import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting MongoDB database seeding...');
    // Clear existing data (careful in production!)
    await prisma.videoInteraction.deleteMany({});
    await prisma.playlistVideo.deleteMany({});
    await prisma.playlist.deleteMany({});
    await prisma.watchHistory.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.videoFile.deleteMany({});
    await prisma.thumbnail.deleteMany({});
    await prisma.video.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    // Create categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Technology',
                slug: 'technology',
                description: 'Tech tutorials, reviews, and news',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Music',
                slug: 'music',
                description: 'Music videos and performances',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Gaming',
                slug: 'gaming',
                description: 'Game playthroughs and reviews',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Education',
                slug: 'education',
                description: 'Educational content and courses',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Entertainment',
                slug: 'entertainment',
                description: 'Movies, shows, and fun content',
            },
        }),
    ]);
    console.log(`✅ Created ${categories.length} categories`);
    // Create tags
    const tags = await Promise.all([
        prisma.tag.create({ data: { name: 'JavaScript', slug: 'javascript' } }),
        prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
        prisma.tag.create({ data: { name: 'Python', slug: 'python' } }),
        prisma.tag.create({ data: { name: 'Web Development', slug: 'web-development' } }),
        prisma.tag.create({ data: { name: 'Tutorial', slug: 'tutorial' } }),
        prisma.tag.create({ data: { name: 'Gaming', slug: 'gaming' } }),
        prisma.tag.create({ data: { name: 'Music', slug: 'music' } }),
        prisma.tag.create({ data: { name: 'Live Performance', slug: 'live-performance' } }),
    ]);
    console.log(`✅ Created ${tags.length} tags`);
    // Create test users
    const password = await hashPassword('password123');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'alice',
                email: 'alice@example.com',
                passwordHash: password,
                role: 'ADMIN',
                bio: 'Platform admin and tech enthusiast',
            },
        }),
        prisma.user.create({
            data: {
                username: 'bob',
                email: 'bob@example.com',
                passwordHash: password,
                role: 'MODERATOR',
                bio: 'Community moderator',
            },
        }),
        prisma.user.create({
            data: {
                username: 'charlie',
                email: 'charlie@example.com',
                passwordHash: password,
                role: 'USER',
                bio: 'Video creator and tech enthusiast',
            },
        }),
        prisma.user.create({
            data: {
                username: 'diana',
                email: 'diana@example.com',
                passwordHash: password,
                role: 'USER',
                bio: 'Gamer and streamer',
            },
        }),
        prisma.user.create({
            data: {
                username: 'eve',
                email: 'eve@example.com',
                passwordHash: password,
                role: 'USER',
                bio: 'Music producer',
            },
        }),
    ]);
    console.log(`✅ Created ${users.length} users`);
    // Create sample videos
    const videos = await Promise.all([
        prisma.video.create({
            data: {
                title: 'Getting Started with React',
                description: 'Learn React basics in this comprehensive tutorial',
                uploaderId: users[2].id,
                categoryId: categories[0].id,
                status: 'READY',
                duration: 3600,
                views: 1250,
                likes: 85,
                dislikes: 5,
                isPublic: true,
                tagIds: [tags[1].id, tags[4].id],
            },
        }),
        prisma.video.create({
            data: {
                title: 'Python for Data Science',
                description: 'Master data science with Python',
                uploaderId: users[2].id,
                categoryId: categories[3].id,
                status: 'READY',
                duration: 5400,
                views: 2440,
                likes: 156,
                dislikes: 8,
                isPublic: true,
                tagIds: [tags[2].id, tags[4].id],
            },
        }),
        prisma.video.create({
            data: {
                title: 'Live Gaming Session - Stream Highlights',
                description: 'Best moments from this week\'s gaming streams',
                uploaderId: users[3].id,
                categoryId: categories[2].id,
                status: 'READY',
                duration: 7200,
                views: 5600,
                likes: 320,
                dislikes: 12,
                isPublic: true,
                tagIds: [tags[5].id, tags[7].id],
            },
        }),
        prisma.video.create({
            data: {
                title: 'New Music Release - Electronic Vibes',
                description: 'Original electronic music track - fresh from the studio',
                uploaderId: users[4].id,
                categoryId: categories[1].id,
                status: 'READY',
                duration: 234,
                views: 1890,
                likes: 210,
                dislikes: 3,
                isPublic: true,
                tagIds: [tags[6].id],
            },
        }),
        prisma.video.create({
            data: {
                title: 'Building a Microservices Architecture',
                description: 'Deep dive into microservices design patterns',
                uploaderId: users[2].id,
                categoryId: categories[0].id,
                status: 'READY',
                duration: 4500,
                views: 980,
                likes: 72,
                dislikes: 4,
                isPublic: true,
                tagIds: [tags[0].id, tags[3].id],
            },
        }),
    ]);
    console.log(`✅ Created ${videos.length} videos`);
    // Create video files (HLS streams)
    await Promise.all([
        prisma.videoFile.create({
            data: {
                videoId: videos[0].id,
                resolution: 'RES_360P',
                fileUrl: 'https://cdn.example.com/videos/001/360p.m3u8',
                format: 'hls',
                size: 256000000,
                bitrate: 800,
            },
        }),
        prisma.videoFile.create({
            data: {
                videoId: videos[0].id,
                resolution: 'RES_720P',
                fileUrl: 'https://cdn.example.com/videos/001/720p.m3u8',
                format: 'hls',
                size: 512000000,
                bitrate: 2500,
            },
        }),
    ]);
    console.log('✅ Created video files');
    // Create thumbnails
    await prisma.thumbnail.create({
        data: {
            videoId: videos[0].id,
            url: 'https://cdn.example.com/videos/001/thumb.jpg',
            timestamp: 30,
        },
    });
    console.log('✅ Created thumbnails');
    // Create watch history
    await Promise.all([
        prisma.watchHistory.create({
            data: {
                userId: users[0].id,
                videoId: videos[0].id,
                progressSeconds: 1200,
            },
        }),
        prisma.watchHistory.create({
            data: {
                userId: users[1].id,
                videoId: videos[1].id,
                progressSeconds: 3600,
            },
        }),
    ]);
    console.log('✅ Created watch history');
    // Create interactions (likes/dislikes)
    await Promise.all([
        prisma.videoInteraction.create({
            data: {
                userId: users[0].id,
                videoId: videos[0].id,
                type: 'LIKE',
            },
        }),
        prisma.videoInteraction.create({
            data: {
                userId: users[1].id,
                videoId: videos[1].id,
                type: 'LIKE',
            },
        }),
    ]);
    console.log('✅ Created interactions');
    // Create comments
    await Promise.all([
        prisma.comment.create({
            data: {
                videoId: videos[0].id,
                userId: users[0].id,
                content: 'Great tutorial! Very helpful for beginners.',
                likes: 12,
            },
        }),
        prisma.comment.create({
            data: {
                videoId: videos[1].id,
                userId: users[1].id,
                content: 'This is exactly what I was looking for.',
                likes: 8,
            },
        }),
    ]);
    console.log('✅ Created comments');
    // Create playlists
    const playlists = await Promise.all([
        prisma.playlist.create({
            data: {
                userId: users[0].id,
                name: 'Web Development Learning Path',
                description: 'Courses and tutorials for learning web dev',
                isPublic: true,
                videos: {
                    create: [
                        { videoId: videos[0].id, position: 1 },
                        { videoId: videos[4].id, position: 2 },
                    ],
                },
            },
        }),
        prisma.playlist.create({
            data: {
                userId: users[3].id,
                name: 'Gaming Highlights',
                isPublic: false,
                videos: {
                    create: [{ videoId: videos[2].id, position: 1 }],
                },
            },
        }),
    ]);
    console.log(`✅ Created ${playlists.length} playlists`);
    // Create a report
    await prisma.report.create({
        data: {
            videoId: videos[2].id,
            userId: users[1].id,
            reason: 'Inappropriate content',
            status: 'PENDING',
        },
    });
    console.log('✅ Created report');
    console.log('🎉 Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
/**
 * Simple hash function for demo purposes
 * In production, use bcrypt or argon2
 */
async function hashPassword(password) {
    // For now, just use a simple hash. In production, use bcrypt:
    // import bcrypt from 'bcrypt';
    // return bcrypt.hash(password, 10);
    return Buffer.from(password).toString('base64');
}
//# sourceMappingURL=seed.js.map