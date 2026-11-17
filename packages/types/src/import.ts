export type ImportResourceType = 'mcq' | 'exercise' | 'lesson';

export type ImportJobStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'partially_completed';

export interface ImportValidationIssue {
  row: number;
  identifier?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportJob {
  id: string;
  resourceType: ImportResourceType;
  technologyId: string;
  submittedBy: string;
  status: ImportJobStatus;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  issues: ImportValidationIssue[];
  createdAt: string;
  completedAt?: string;
}
