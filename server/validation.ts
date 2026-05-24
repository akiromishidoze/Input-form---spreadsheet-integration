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
  const MAX_FORM_LENGTH = 100;
  const MAX_STRING_LENGTH = 500;
  const MAX_DATA_KEYS = 50;

  if (!body.form || typeof body.form !== 'string' || !body.form.trim()) {
    errors.push({ field: 'form', message: 'form is required and must be a non-empty string' });
  } else if (body.form.length > MAX_FORM_LENGTH) {
    errors.push({ field: 'form', message: `form must be at most ${MAX_FORM_LENGTH} characters` });
  }

  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data) || body.data === null) {
    errors.push({ field: 'data', message: 'data is required and must be an object' });
  } else {
    const data = body.data as Record<string, unknown>;
    const keys = Object.keys(data);
    if (keys.length > MAX_DATA_KEYS) {
      errors.push({ field: 'data', message: `data must have at most ${MAX_DATA_KEYS} fields` });
    }
    for (const [k, v] of Object.entries(data)) {
      if (k.length > 100) errors.push({ field: 'data', message: `data key "${k}" exceeds 100 characters` });
      if (typeof v === 'string' && v.length > MAX_STRING_LENGTH) {
        errors.push({ field: 'data', message: `value for "${k}" must be at most ${MAX_STRING_LENGTH} characters` });
      }
    }
  }

  if (body.submitted !== undefined && typeof body.submitted !== 'string') {
    errors.push({ field: 'submitted', message: 'submitted must be a string (ISO date)' });
  }

  if (typeof body.submitted === 'string' && isNaN(Date.parse(body.submitted))) {
    errors.push({ field: 'submitted', message: 'submitted must be a valid ISO date string' });
  }

  return errors;
}
