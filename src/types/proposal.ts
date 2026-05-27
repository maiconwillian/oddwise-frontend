import type { Suggestion } from '@/types/suggestion';

export type GenerateWeeklyResult = {
  from: string;
  to: string;
  created: number;
  skipped: number;
  alreadyProposed: number;
  maxPerWeek: number;
  errors: string[];
  message: string;
};

export type ProposedParams = {
  from?: string;
  to?: string;
};

export type AcceptProposalPayload = {
  stake?: number;
};

export type Proposal = Suggestion & {
  proposalReason?: string | null;
};
