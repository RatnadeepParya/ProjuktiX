export interface Certificate {
  id: string; // Unique public verification identifier
  certificateNumber: string; // Formatted credential e.g. PJX-2026-XXXX-XXXX
  userId: string;
  recipientName: string;
  technologyId: string;
  technologyName: string;
  assessmentSetId: string;
  assessmentTitle: string;
  assessmentAttemptId: string;
  score: number;
  passPercentage: number;
  issuedAt: string;
  expiresAt?: string;
  verificationUrl: string;
  issuer: {
    organization: string;
    platform: string;
    disclaimer: string;
  };
}
