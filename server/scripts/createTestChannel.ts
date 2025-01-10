import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestChannel() {
  try {
    // Create a test user if it doesn't exist
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'test123', // In a real app, this would be hashed
        status: 'active'
      }
    });

    // Create a test channel
    const channel = await prisma.channel.create({
      data: {
        name: 'pagination-test',
        description: 'A channel to test message pagination',
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'admin'
          }
        }
      }
    });

    // Create 105 test messages with timestamps 1 minute apart
    const baseTime = new Date();
    const messages = await Promise.all(
      Array.from({ length: 105 }).map(async (_, index) => {
        const timestamp = new Date(baseTime.getTime() - (index * 60000)); // 1 minute apart
        return prisma.message.create({
          data: {
            content: `Test message ${index + 1} - ${timestamp.toISOString()}`,
            userId: user.id,
            channelId: channel.id,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      })
    );

    console.log('Created test channel:', channel.name);
    console.log('Created messages:', messages.length);
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestChannel(); 