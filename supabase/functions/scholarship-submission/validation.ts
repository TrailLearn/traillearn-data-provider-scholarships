export interface SubmissionPayload {
    name: string;
    source_url: string;
    amount_min?: number;
    amount_max?: number;
    data?: any;
}

export function validateSubmission(payload: SubmissionPayload): string[] {
    const errors: string[] = [];

    // 1. Mandatory Fields
    if (!payload.name || payload.name.trim() === '') {
        errors.push('name is required');
    }
    if (!payload.source_url || payload.source_url.trim() === '') {
        errors.push('source_url is required');
    }

    // 2. URL Validation
    if (payload.source_url) {
        try {
            const url = new URL(payload.source_url);
            if (url.protocol !== 'https:') {
                errors.push('source_url must be HTTPS');
            }
        } catch {
            errors.push('source_url is invalid');
        }
    }

    // 3. Financial Consistency
    if (payload.amount_min !== undefined && payload.amount_max !== undefined) {
        if (payload.amount_min > payload.amount_max) {
            errors.push('amount_min cannot be greater than amount_max');
        }
    }

    // 4. Sanitization (Basic)
    if (payload.name && /<script|javascript:/i.test(payload.name)) {
        errors.push('name contains illegal characters');
    }

    return errors;
}
