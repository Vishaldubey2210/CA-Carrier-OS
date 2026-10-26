import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

export interface NotificationItem {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  message: string;
  category: 'CAREER' | 'APPLICATION' | 'SECURITY' | 'BILLING' | 'SYSTEM';
  linkUrl?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly memNotifications: Map<string, NotificationItem[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all notifications and compute real unread count
   */
  async getNotifications(userId: string, workspaceId: string): Promise<{
    unreadCount: number;
    items: NotificationItem[];
  }> {
    if (this.prisma.isDatabaseConnected()) {
      try {
        let dbNotifs = await this.prisma.notification.findMany({
          where: { userId, workspaceId },
          orderBy: { createdAt: 'desc' },
        });

        if (dbNotifs.length === 0) {
          // Seed initial welcome notifications in DB
          const seedItems = [
            {
              id: randomUUID(),
              userId,
              workspaceId,
              title: 'Welcome to CA Career OS',
              message: 'Your personal workspace is initialized with Candidate Blindfold protection active.',
              category: 'SECURITY',
              linkUrl: '/career',
              isRead: false,
              createdAt: new Date(),
            },
            {
              id: randomUUID(),
              userId,
              workspaceId,
              title: 'Complete Your Articleship Inventory',
              message: 'Document your audit, tax, or corporate exposure to unlock verified resume tailoring.',
              category: 'CAREER',
              linkUrl: '/onboarding',
              isRead: false,
              createdAt: new Date(Date.now() - 3600 * 1000),
            },
          ];

          await this.prisma.notification.createMany({
            data: seedItems,
          });

          dbNotifs = await this.prisma.notification.findMany({
            where: { userId, workspaceId },
            orderBy: { createdAt: 'desc' },
          });
        }

        const unreadCount = dbNotifs.filter((n: any) => !n.isRead).length;
        return {
          unreadCount,
          items: dbNotifs.map((n: any) => ({
            id: n.id,
            userId: n.userId,
            workspaceId: n.workspaceId,
            title: n.title,
            message: n.message,
            category: n.category as any,
            linkUrl: n.linkUrl || undefined,
            isRead: n.isRead,
            createdAt: n.createdAt,
            readAt: n.readAt || undefined,
          })),
        };
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          this.logger.error(`Database error fetching notifications in production: ${err.message}`);
          throw new ServiceUnavailableException('Notifications service temporarily unavailable. Durable storage offline.');
        }
        this.logger.warn(`Failed to fetch notifications from DB, falling back to memory: ${err.message}`);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Notifications service temporarily unavailable. Durable storage offline.');
    }

    let userNotifs = this.memNotifications.get(userId);

    // If user has no notifications initialized, seed with authentic system welcome notices
    if (!userNotifs) {
      userNotifs = [
        {
          id: randomUUID(),
          userId,
          workspaceId,
          title: 'Welcome to CA Career OS',
          message: 'Your personal workspace is initialized with Candidate Blindfold protection active.',
          category: 'SECURITY',
          linkUrl: '/career',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          userId,
          workspaceId,
          title: 'Complete Your Articleship Inventory',
          message: 'Document your audit, tax, or corporate exposure to unlock verified resume tailoring.',
          category: 'CAREER',
          linkUrl: '/onboarding',
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000),
        },
      ];
      this.memNotifications.set(userId, userNotifs);
    }

    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    return {
      unreadCount,
      items: userNotifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<{ success: true }> {
    if (this.prisma.isDatabaseConnected()) {
      try {
        await this.prisma.notification.updateMany({
          where: { id: notificationId, userId },
          data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Failed to update notification status. Durable storage offline.');
        }
        this.logger.warn(`Failed to update notification read status in DB: ${err.message}`);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Failed to update notification status. Durable storage offline.');
    }

    const userNotifs = this.memNotifications.get(userId);
    if (userNotifs) {
      const notif = userNotifs.find((n) => n.id === notificationId);
      if (notif) {
        notif.isRead = true;
        notif.readAt = new Date();
      }
    }
    return { success: true };
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ success: true }> {
    if (this.prisma.isDatabaseConnected()) {
      try {
        await this.prisma.notification.updateMany({
          where: { userId },
          data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Failed to update notification status. Durable storage offline.');
        }
        this.logger.warn(`Failed to mark all notifications read in DB: ${err.message}`);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Failed to update notification status. Durable storage offline.');
    }

    const userNotifs = this.memNotifications.get(userId);
    if (userNotifs) {
      for (const n of userNotifs) {
        n.isRead = true;
        n.readAt = new Date();
      }
    }
    return { success: true };
  }
}
