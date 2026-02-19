export type ScholarshipStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'DEPRECATED' | 'ARCHIVED';

export interface Scholarship {
  id: string;
  name: string;
  source_url: string;
  status: ScholarshipStatus;
  deadline_at: string | null;
  health_score: number;
  last_verified_at: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}
