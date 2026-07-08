import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContributionMonitorAgent {
  private readonly logger = new Logger(ContributionMonitorAgent.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async monitorContributions() {
    const start = Date.now();
    this.logger.log('🤖 Contribution Monitor Agent running...');

    let processed = 0;
    try {
      const pendingFines = await this.prisma.fine.findMany({
        where: { status: 'OUTSTANDING' },
      });

      processed = pendingFines.length;

      if (pendingFines.length === 0) {
        this.logger.log('✅ No outstanding fines at this time.');
      } else {
        this.logger.log(
          `⚠️  Found ${pendingFines.length} outstanding fines.`,
        );

        for (const fine of pendingFines) {
          this.logger.log(
            `📋 Fine ${fine.id} — Member: ${fine.memberId} — Amount: ${fine.amountXAF} XAF — Reason: ${fine.reason}`,
          );
        }
      }

      await this.prisma.agentRunLog.upsert({
        where: { agentName: 'Contribution Monitor Agent' },
        update: {
          lastRunAt: new Date(),
          lastRunDurationMs: Date.now() - start,
          lastRunRecordsProcessed: processed,
          status: 'HEALTHY',
        },
        create: {
          agentName: 'Contribution Monitor Agent',
          lastRunAt: new Date(),
          lastRunDurationMs: Date.now() - start,
          lastRunRecordsProcessed: processed,
          status: 'HEALTHY',
        },
      });
    } catch (e) {
      this.logger.error('❌ Contribution Monitor Agent error', e);
      await this.prisma.agentRunLog.upsert({
        where: { agentName: 'Contribution Monitor Agent' },
        update: {
          lastRunAt: new Date(),
          lastRunDurationMs: Date.now() - start,
          status: 'ERROR',
        },
        create: {
          agentName: 'Contribution Monitor Agent',
          lastRunAt: new Date(),
          lastRunDurationMs: Date.now() - start,
          lastRunRecordsProcessed: 0,
          status: 'ERROR',
        },
      });
    }
  }

  async autoTriggerFinesForCycle(
    cycleId: string,
    pendingMemberIds: string[],
    fineAmountXAF: number,
  ) {
    this.logger.log(
      `🤖 Auto-triggering fines for ${pendingMemberIds.length} members in cycle ${cycleId}`,
    );

    for (const memberId of pendingMemberIds) {
      const fine = await this.prisma.fine.create({
        data: {
          memberId,
          cycleId,
          amountXAF: fineAmountXAF,
          reason: 'LATE',
          status: 'OUTSTANDING',
        },
      });

      await this.prisma.auditLog.create({
        data: {
          entityType: 'FINE',
          entityId: fine.id,
          actionType: 'FINE_AUTO_TRIGGERED',
          newValue: JSON.stringify(fine),
          actorId: 'CONTRIBUTION_MONITOR_AGENT',
          actorType: 'AGENT',
        },
      });

      this.logger.log(
        `✅ Fine auto-triggered for member ${memberId} — ${fineAmountXAF} XAF`,
      );
    }
  }
}