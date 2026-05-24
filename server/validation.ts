export function sanitize(val: unknown): unknown {
  if (typeof val === 'string') return val.replace(/<[^>]*>/g, '').trim();
  return val;
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = sanitize(v);
  }
  return out;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEntry(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.form || typeof body.form !== 'string' || !body.form.trim()) {
    errors.push({ field: 'form', message: 'form is required and must be a non-empty string' });
  }

  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data) || body.data === null) {
    errors.push({ field: 'data', message: 'data is required and must be an object' });
  }

  if (body.submitted !== undefined && typeof body.submitted !== 'string') {
    errors.push({ field: 'submitted', message: 'submitted must be a string (ISO date)' });
  }

  if (typeof body.submitted === 'string' && isNaN(Date.parse(body.submitted))) {
    errors.push({ field: 'submitted', message: 'submitted must be a valid ISO date string' });
  }

  return errors;
}
