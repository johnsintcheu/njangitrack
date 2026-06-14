import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CycleModule } from './cycle/cycle.module';
import { ContributionModule } from './contribution/contribution.module';
import { PayoutReadinessAgent } from './agents/payout-readiness.agent';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CycleModule,
    ContributionModule,
  ],
  providers: [PayoutReadinessAgent],
})
export class AppModule {}