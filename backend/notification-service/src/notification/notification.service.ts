import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  async sendNotification(data: {
    recipientId: string;
    type: string;
    channel: 'SMS' | 'PUSH';
    messageContent: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        channel: data.channel,
        messageContent: data.messageContent,
        deliveryStatus: 'PENDING',
      },
    });

    this.logger.log(
      `📨 Sending ${data.channel} to member ${data.recipientId}: ${data.messageContent}`,
    );

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        deliveryStatus: 'SENT',
        sentAt: new Date(),
      },
    });

    this.logger.log(`✅ Notification sent successfully to ${data.recipientId}`);

    return notification;
  }

  async getNotificationsByMember(recipientId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async retryFailedNotifications() {
    const failed = await this.prisma.notification.findMany({
      where: { deliveryStatus: 'FAILED', retryCount: { lt: 3 } },
    });

    for (const notification of failed) {
      this.logger.log(`🔄 Retrying notification ${notification.id}...`);

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          deliveryStatus: 'RETRYING',
          retryCount: notification.retryCount + 1,
        },
      });
    }

    return failed.length;
  }
}
