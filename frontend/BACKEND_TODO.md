# Backend To-Do — required for the new frontend features to go fully live

The frontend changes are complete and will run today, but four things call
endpoints that don't exist in your NestJS services yet. Everything degrades
gracefully (loading states / empty states / a yellow warning banner on the
Agents page) until you add these. This file is everything you need to wire
them up across your five microservices.

---

## 1. Registration role field — Identity Service

Your register form now sends a `role` field:
`'MEMBER' | 'TREASURER' | 'GROUP_ADMIN'`.

In the Identity service:

- Add `role` to `RegisterDto` (class-validator: `@IsIn(['MEMBER','TREASURER','GROUP_ADMIN'])`).
- Add/confirm a `role` column on your Prisma `User` model in the `public` schema
  (you already have this for `SUPER_ADMIN`/`GROUP_ADMIN` per your admin-role
  Neon SQL update, so this is likely just relaxing the enum + DTO validation).
- In `auth.service.ts`, pass `role: dto.role` into `prisma.user.create(...)`
  instead of hardcoding `MEMBER`.
- Reject `SUPER_ADMIN` at the DTO level — that role stays admin-assigned only.

```ts
// identity-service/src/auth/dto/register.dto.ts
export class RegisterDto {
  // ...existing fields
  @IsIn(['MEMBER', 'TREASURER', 'GROUP_ADMIN'])
  role: 'MEMBER' | 'TREASURER' | 'GROUP_ADMIN';
}
```

## 2. `GET /users` and `POST /users/invite` — Identity Service

Used by the admin dashboard, Members page, and member dashboard.

```ts
// identity-service/src/users/users.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Get()
findAll() {
  return this.usersService.findAll(); // prisma.user.findMany()
}

@Roles('GROUP_ADMIN', 'SUPER_ADMIN')
@Post('invite')
invite(@Body() dto: InviteDto) {
  return this.usersService.invite(dto.phoneNumber);
  // creates a pending user row + fires an SMS via the Notification service
}
```

## 3. Session Reports CRUD — Ledger Service

Powers the new **Reports** page (`app/reports/page.tsx`). Add a Prisma model
in the `ledger` schema:

```prisma
model SessionReport {
  id                     String   @id @default(uuid())
  groupId                String
  title                  String
  cycleId                String?
  meetingDate            DateTime
  authorId               String
  authorName             String
  summary                String
  contributionsTotalXAF  Int
  finesTotalXAF          Int
  socialFundBalanceXAF   Int
  beneficiaryName        String?
  attendeesCount         Int
  decisions              String?
  createdAt              DateTime @default(now())
}
```

```ts
// ledger-service/src/reports/reports.controller.ts
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get()
  findAll() { return this.reports.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GROUP_ADMIN', 'SUPER_ADMIN', 'TREASURER')
  @Post()
  create(@Body() dto: CreateReportDto) { return this.reports.create(dto); }
}
```

Run `npx prisma migrate dev --name add_session_reports` (remember: pin
Prisma to 4.16.2, invoke as `node_modules\.bin\prisma` on your machine).

## 4. `GET /agents/status` — every service, one shared pattern

Powers the new **System Health** page (`app/agents/page.tsx`) — this is the
"how do I know the agents are really running" answer for your jury.

Add one small table + one small module to **each** of the 5 services (or just
the 4 that host a cron: Ledger, Fine, Loan, Notification):

```prisma
model AgentRunLog {
  id                   String   @id @default(uuid())
  agentName            String
  lastRunAt            DateTime
  lastRunDurationMs     Int
  lastRunRecordsProcessed Int
  status               String   // HEALTHY | ERROR
}
```

```ts
// shared pattern inside each CronJob, e.g. Fine Service's
// contribution-monitor.agent.ts
@Cron('* * * * *')
async handleCron() {
  const start = Date.now();
  let processed = 0;
  try {
    processed = await this.fineService.scanAndFineOverdue();
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
    await this.prisma.agentRunLog.upsert({ /* ...status: 'ERROR' */ });
  }
}
```

```ts
// agents/agents.controller.ts (add to each service)
@Controller('agents')
export class AgentsController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  async status() {
    const logs = await this.prisma.agentRunLog.findMany();
    return logs.map((l) => ({
      agentName: l.agentName,
      service: 'Fine Service', // change per service
      schedule: '* * * * *',
      lastRunAt: l.lastRunAt,
      lastRunDurationMs: l.lastRunDurationMs,
      lastRunRecordsProcessed: l.lastRunRecordsProcessed,
      status: this.isStale(l.lastRunAt) ? 'STALE' : l.status,
    }));
  }

  private isStale(lastRunAt: Date) {
    return Date.now() - new Date(lastRunAt).getTime() > 5 * 60 * 1000; // 5 min
  }
}
```

Once this is deployed on Render, the Agents page will show a live green pulse
next to each agent and the exact "last run X min ago" — the clearest possible
proof for your defense that these are real autonomous processes, not mocked
demo data.

---

## Everything else (already done, frontend-only)

- Registration role picker — done, just needs #1 above on the backend.
- Contribution form — already wired to the real Ledger API, untouched.
- Fines / Loans pages — already wired to real APIs, untouched, just re-styled
  for dark mode + responsiveness.
- Dark/light mode — fully client-side, no backend needed.
- Responsive layout — fully client-side, no backend needed.
- All hardcoded mock arrays in the Admin Dashboard, Members page, Member
  Dashboard, and Notifications page have been removed and replaced with real
  API calls (see items #2–4 above for the few new endpoints they now expect).
