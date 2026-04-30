import { api } from './api';

export interface SyncLogEntry {
  id: number;
  data: string;
  produtos_atualizados: number;
  departamentos: string[];
  source?: string | null;
  job_id?: string | null;
}

export interface SyncStatusResponse {
  enabled: boolean;
  latest_sync: SyncLogEntry | null;
  history: SyncLogEntry[];
  runtime?: {
    state?: string;
    last_completed_at?: string | null;
    last_error?: string | null;
  };
  latest_job?: {
    job_id: string;
    source?: string | null;
    filename?: string | null;
    total_lines?: number | null;
    valid_count?: number | null;
    quarantine_count?: number | null;
    created_at?: string | null;
  } | null;
}

class SyncStatusService {
  async getStatus(): Promise<SyncStatusResponse> {
    return api.get('/sync-status');
  }
}

export const syncStatusService = new SyncStatusService();
