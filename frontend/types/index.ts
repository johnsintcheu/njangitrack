export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: 'MEMBER' | 'TREASURER' | 'GROUP_ADMIN' | 'SUPER_ADMIN'
  language: 'FR' | 'EN'
  kycStatus: 'PENDING' | 'VERIFIED'
  createdAt: string
}

export interface Contribution {
  id: string
  cycleId: string
  memberId: string
  memberName: string
  amountXAF: number
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'
  paymentDate: string
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'OVERDUE'
  proofFileKey?: string
  verifiedBy?: string
  note?: string
}

export interface Loan {
  id: string
  borrowerId: string
  borrowerName: string
  principalXAF: number
  monthlyInterestRate: number
  disbursedAt: string
  status: 'ACTIVE' | 'REPAID' | 'DEFAULTED'
  outstandingBalanceXAF: number
  projectedPayoffDate: string
}

export interface Fine {
  id: string
  memberId: string
  memberName: string
  cycleId: string
  amountXAF: number
  reason: 'LATE' | 'ABSENCE'
  triggeredAt: string
  status: 'OUTSTANDING' | 'PAID' | 'WAIVED' | 'DISPUTED'
  disputeReason?: string
}

export interface Cycle {
  id: string
  groupId: string
  cycleNumber: number
  beneficiaryId: string
  beneficiaryName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'CLOSED' | 'PAYOUT_READY'
  potAmountXAF: number
  confirmationPercentage: number
}

export interface LoginCredentials {
  phoneNumber: string
  password: string
}

export interface RegisterData {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  language: 'FR' | 'EN'
  quartier: string
  role: 'MEMBER' | 'TREASURER' | 'GROUP_ADMIN'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SessionReport {
  id: string
  groupId: string
  title: string
  cycleId?: string
  meetingDate: string
  authorId: string
  authorName: string
  summary: string
  contributionsTotalXAF: number
  finesTotalXAF: number
  socialFundBalanceXAF: number
  beneficiaryName: string
  attendeesCount: number
  decisions: string
  createdAt: string
}

export interface AgentStatus {
  agentName: string
  service: string
  schedule: string
  lastRunAt: string | null
  lastRunDurationMs: number | null
  lastRunRecordsProcessed: number | null
  status: 'HEALTHY' | 'STALE' | 'ERROR' | 'UNKNOWN'
}

export interface Notification {
  id: string
  memberId: string
  type: 'CONTRIBUTION' | 'REMINDER' | 'FINE' | 'LOAN' | 'PAYOUT' | 'GENERAL'
  message: string
  channel: string
  status: 'DELIVERED' | 'FAILED' | 'PENDING'
  createdAt: string
}

export interface Member {
  id: string
  fullName: string
  phoneNumber: string
  quartier?: string
  role: 'MEMBER' | 'TREASURER' | 'GROUP_ADMIN' | 'SUPER_ADMIN'
  createdAt: string
}