import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class NotificationSchedulerAgent {
  private readonly logger = new Logger(NotificationSchedulerAgent.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendScheduledReminders() {
    this.logger.log('🤖 Notification Scheduler Agent running...');

    const pending = await this.prisma.notification.findMany({
      where: { deliveryStatus: 'PENDING' },
    });

    if (pending.length === 0) {
      this.logger.log('✅ No pending notifications at this time.');
      return;
    }

    this.logger.log(`📨 Processing ${pending.length} pending notifications...`);

    for (const notification of pending) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          deliveryStatus: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Notification sent to ${notification.recipientId} via ${notification.channel}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async retryFailedNotifications() {
    this.logger.log('🔄 Retrying failed notifications...');
    const count = await this.notificationService.retryFailedNotifications();
    if (count > 0) {
      this.logger.log(`🔄 Retried ${count} failed notifications`);
    }
  }

  async scheduleContributionReminder(
    memberId: string,
    daysBeforeDeadline: number,
    deadlineDate: Date,
  ) {
    const messages: Record<number, string> = {
      7: `Reminder: Your Njangi contribution is due in 7 days on ${deadlineDate.toDateString()}`,
      3: `Reminder: Your Njangi contribution is due in 3 days on ${deadlineDate.toDateString()}`,
      1: `Urgent: Your Njangi contribution is due TOMORROW on ${deadlineDate.toDateString()}`,
      0: `FINAL REMINDER: Your Njangi contribution is due TODAY!`,
    };

    const message = messages[daysBeforeDeadline] || 
      `Reminder: Your Njangi contribution deadline is approaching`;

    await this.notificationService.sendNotification({
      recipientId: memberId,
      type: 'CONTRIBUTION_REMINDER',
      channel: 'SMS',
      messageContent: message,
    });

    this.logger.log(
      `📅 Scheduled T-${daysBeforeDeadline} reminder for member ${memberId}`,
    );
  }
}