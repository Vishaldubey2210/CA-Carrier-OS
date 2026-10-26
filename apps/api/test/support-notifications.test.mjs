import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SupportService } from '../dist/modules/support/support.service.js';
import { NotificationsService } from '../dist/modules/notifications/notifications.service.js';

describe('Support & Notifications Domain Services Suite', () => {
  const mockPrisma = {
    isDatabaseConnected: () => false,
  };

  const supportService = new SupportService(mockPrisma);
  const notifsService = new NotificationsService(mockPrisma);

  test('1. Support: Successfully submits valid contact inquiry and generates ticketRef', async () => {
    const res = await supportService.submitEnquiry(
      {
        name: 'CA Priya Sharma',
        email: 'priya.sharma@example.com',
        category: 'CAREER_SUPPORT',
        subject: 'Articleship Form 108 verification inquiry',
        message: 'I have 156 weeks of statutory audit exposure from a mid-size firm and would like to verify my credentials.',
      },
      '192.168.1.50'
    );

    assert.equal(res.success, true);
    assert.match(res.ticketRef, /^TKT-2026-[A-F0-9]{6}$/);
    assert.equal(res.emailDispatched, false); // Honest mock mode reporting
  });

  test('2. Support: Rejects invalid or incomplete contact submissions', async () => {
    // Missing name
    await assert.rejects(
      async () => {
        await supportService.submitEnquiry({
          name: '',
          email: 'valid@example.com',
          category: 'GENERAL',
          subject: 'Valid Subject',
          message: 'Valid message content with enough length.',
        });
      },
      { name: 'BadRequestException' }
    );

    // Invalid email
    await assert.rejects(
      async () => {
        await supportService.submitEnquiry({
          name: 'Valid Name',
          email: 'invalid-email-address',
          category: 'GENERAL',
          subject: 'Valid Subject',
          message: 'Valid message content with enough length.',
        });
      },
      { name: 'BadRequestException' }
    );

    // Message too short
    await assert.rejects(
      async () => {
        await supportService.submitEnquiry({
          name: 'Valid Name',
          email: 'valid@example.com',
          category: 'GENERAL',
          subject: 'Valid Subject',
          message: 'Too short',
        });
      },
      { name: 'BadRequestException' }
    );
  });

  test('3. Support: Rate limiting enforces max 5 requests per IP', async () => {
    const testIp = '10.0.0.99';
    for (let i = 0; i < 5; i++) {
      await supportService.submitEnquiry(
        {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          category: 'GENERAL',
          subject: `Inquiry Subject ${i}`,
          message: 'This is a valid structured message for testing rate limit.',
        },
        testIp
      );
    }

    // 6th request should fail with 429 HttpException
    await assert.rejects(
      async () => {
        await supportService.submitEnquiry(
          {
            name: 'User Abusive',
            email: 'abusive@example.com',
            category: 'GENERAL',
            subject: 'Inquiry Subject Abusive',
            message: 'This is a valid structured message for testing rate limit.',
          },
          testIp
        );
      },
      (err) => err.status === 429
    );
  });

  test('4. Support: List enquiries returns submitted records', async () => {
    const list = await supportService.listEnquiries();
    assert.ok(list.length >= 6);
    assert.ok(list[0].ticketRef);
  });

  test('5. Notifications: Fetches seeded system notifications and unread count', async () => {
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testWsId = '00000000-0000-0000-0000-000000000002';

    const notifs = await notifsService.getNotifications(testUserId, testWsId);
    assert.equal(notifs.unreadCount, 2);
    assert.equal(notifs.items.length, 2);
    assert.equal(notifs.items[0].isRead, false);
  });

  test('6. Notifications: Marks single and all notifications as read', async () => {
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testWsId = '00000000-0000-0000-0000-000000000002';

    const initial = await notifsService.getNotifications(testUserId, testWsId);
    const firstNotifId = initial.items[0].id;

    await notifsService.markAsRead(firstNotifId, testUserId);
    const afterOne = await notifsService.getNotifications(testUserId, testWsId);
    assert.equal(afterOne.unreadCount, 1);

    await notifsService.markAllAsRead(testUserId);
    const afterAll = await notifsService.getNotifications(testUserId, testWsId);
    assert.equal(afterAll.unreadCount, 0);
  });

  test('7. Database Integration Contract: Persistent storage paths execute via PrismaClient when connected', async () => {
    const dbEnquiries = [];
    const dbNotifs = [];

    const connectedPrisma = {
      isDatabaseConnected: () => true,
      supportEnquiry: {
        create: async ({ data }) => {
          dbEnquiries.push({ ...data, createdAt: new Date() });
          return data;
        },
        findMany: async () => dbEnquiries,
      },
      notification: {
        findMany: async ({ where }) => dbNotifs.filter(n => n.userId === where.userId),
        createMany: async ({ data }) => {
          dbNotifs.push(...data);
          return { count: data.length };
        },
        updateMany: async ({ where, data }) => {
          let count = 0;
          for (const n of dbNotifs) {
            if ((!where.id || n.id === where.id) && n.userId === where.userId) {
              Object.assign(n, data);
              count++;
            }
          }
          return { count };
        },
      },
    };

    const dbSupport = new SupportService(connectedPrisma);
    const dbNotifications = new NotificationsService(connectedPrisma);

    // Test support persistence
    const enquiry = await dbSupport.submitEnquiry({
      name: 'CA Amit Verma',
      email: 'amit.verma@example.com',
      category: 'GENERAL',
      subject: 'Database Persistence Test',
      message: 'Verifying that support enquiries persist correctly to database tables.',
    }, '10.0.0.101');

    assert.equal(enquiry.success, true);
    assert.equal(dbEnquiries.length, 1);
    assert.equal(dbEnquiries[0].ticketRef, enquiry.ticketRef);

    const listed = await dbSupport.listEnquiries();
    assert.equal(listed.length, 1);
    assert.equal(listed[0].ticketRef, enquiry.ticketRef);

    // Test notification persistence
    const uId = '00000000-0000-0000-0000-000000000005';
    const wsId = '00000000-0000-0000-0000-000000000006';

    const notifs = await dbNotifications.getNotifications(uId, wsId);
    assert.equal(notifs.items.length, 2);
    assert.equal(dbNotifs.length, 2);

    await dbNotifications.markAsRead(notifs.items[0].id, uId);
    const updated = await dbNotifications.getNotifications(uId, wsId);
    assert.equal(updated.unreadCount, 1);

    // Production Database Failure Regression Tests:
    // Verify that PostgreSQL runtime failures never silently fallback to memory in production
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';

      // 1. Simulate runtime DB crash (query throws error on write/read)
      const crashingPrisma = {
        isDatabaseConnected: () => true,
        supportEnquiry: {
          create: async () => { throw new Error('PostgreSQL socket closed unexpectedly (EOF)'); },
          findMany: async () => { throw new Error('Connection terminated due to administrator command'); },
        },
        notification: {
          findMany: async () => { throw new Error('Connection pool exhausted'); },
          updateMany: async () => { throw new Error('Connection pool exhausted'); },
        },
      };

      const failingSupport = new SupportService(crashingPrisma);
      const failingNotifications = new NotificationsService(crashingPrisma);

      await assert.rejects(
        async () => {
          await failingSupport.submitEnquiry({
            name: 'CA Priya Sharma',
            email: 'priya@example.com',
            category: 'GENERAL',
            subject: 'Emergency Audit Issue',
            message: 'Testing production database runtime crash handling.',
          }, '10.0.0.199');
        },
        { name: 'ServiceUnavailableException' },
        'Support submission must throw ServiceUnavailableException when DB crashes in production'
      );

      await assert.rejects(
        async () => {
          await failingSupport.listEnquiries();
        },
        { name: 'ServiceUnavailableException' },
        'Support listing must throw ServiceUnavailableException when DB crashes in production'
      );

      await assert.rejects(
        async () => {
          await failingNotifications.getNotifications(uId, wsId);
        },
        { name: 'ServiceUnavailableException' },
        'Notifications fetch must throw ServiceUnavailableException when DB crashes in production'
      );

      await assert.rejects(
        async () => {
          await failingNotifications.markAsRead('some-id', uId);
        },
        { name: 'ServiceUnavailableException' },
        'Notification markAsRead must throw ServiceUnavailableException when DB crashes in production'
      );

      // 2. Simulate complete DB disconnection during runtime
      const disconnectedPrisma = {
        isDatabaseConnected: () => false,
      };
      const disconnectedSupport = new SupportService(disconnectedPrisma);
      const disconnectedNotifications = new NotificationsService(disconnectedPrisma);

      await assert.rejects(
        async () => {
          await disconnectedSupport.submitEnquiry({
            name: 'CA Priya Sharma',
            email: 'priya@example.com',
            category: 'GENERAL',
            subject: 'Emergency Audit Issue',
            message: 'Testing production disconnected DB state.',
          }, '10.0.0.200');
        },
        { name: 'ServiceUnavailableException' },
        'Support submission must reject if DB is disconnected in production'
      );

      await assert.rejects(
        async () => {
          await disconnectedNotifications.getNotifications(uId, wsId);
        },
        { name: 'ServiceUnavailableException' },
        'Notifications fetch must reject if DB is disconnected in production'
      );
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
