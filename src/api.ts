const TOKEN_KEY = 'auth_token';
const API = '/api/entries';

export interface Entry {
  id: string;
  form: string;
  data: Record<string, unknown>;
  submitted: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  setToken(data.token);
  return data.token;
}

export interface PaginatedResult {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchEntries(page = 1, limit = 10000): Promise<Entry[]> {
  const res = await fetch(`${API}?page=${page}&limit=${limit}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result: PaginatedResult = await res.json();
  return result.entries;
}

export async function addEntry(formName: string, data: Record<string, unknown>): Promise<Entry> {
  const body = { form: formName, data, submitted: new Date().toISOString() };
  const res = await fetch(API, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json();
  return { id: result.id, form: formName, data: { ...data }, submitted: body.submitted };
}

export async function updateEntry(id: string, formName: string, data: Record<string, unknown>): Promise<Entry> {
  const body = { form: formName, data, submitted: new Date().toISOString() };
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json();
  return { id: result.id, form: formName, data: { ...data }, submitted: body.submitted };
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function clearEntries(): Promise<void> {
  const res = await fetch(API, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
