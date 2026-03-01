export interface LegalAnalysis {
    summary_simple: string;
    what_it_means: string[];
    key_clauses: Array<{ title: string; explanation: string; risk: string }>;
    red_flags: Array<{ reason: string; severity: string }>;
    documents_required: Array<{ name: string; purpose: string; how_to_obtain: string[] }>;
    error?: string;
}
