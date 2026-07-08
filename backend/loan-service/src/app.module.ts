import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { LoanModule } from './loan/loan.module';
import { LoanInterestAccrualAgent } from './agents/loan-interest-accrual.agent';
import { AgentsController } from './agents/agents.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    LoanModule,
  ],
  controllers: [AgentsController],
  providers: [LoanInterestAccrualAgent],
})
export class AppModule {}