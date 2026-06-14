import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContributionService {
  constructor(private prisma: PrismaService) {}

  async recordContribution(data: {
    cycleId: string;
    memberId: string;
    amountXAF: number;
    paymentMethod: string;
    paymentDate: Date;
    note?: string;
  }) {
    const contribution = await this.prisma.contribution.create({
      data: {
        cycleId: data.cycleId,
        memberId: data.memberId,
        amountXAF: data.amountXAF,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        note: data.note,
        status: 'PENDING',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        entityType: 'CONTRIBUTION',
        entityId: contribution.id,
        actionType: 'CREATED',
        newValue: JSON.stringify(contribution),
        actorId: data.memberId,
        actorType: 'HUMAN',
      },
    });

    return contribution;
  }

  async confirmContribution(contributionId: string, treasurerId: string) {
    const contribution = await this.prisma.contribution.update({
      where: { id: contributionId },
      data: {
        status: 'CONFIRMED',
        verifiedBy: treasurerId,
        verifiedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        entityType: 'CONTRIBUTION',
        entityId: contributionId,
        actionType: 'CONFIRMED',
        newValue: JSON.stringify(contribution),
        actorId: treasurerId,
        actorType: 'HUMAN',
      },
    });

    return contribution;
  }

  async getCycleContributions(cycleId: string) {
    return this.prisma.contribution.findMany({
      where: { cycleId },
    });
  }
}