const API = '/api/entries';

export async function fetchEntries() {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addEntry(formName, data) {
  const body = { form: formName, data, submitted: new Date().toISOString() };
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json();
  return { id: result.id, form: formName, data: { ...data }, submitted: body.submitted };
}

export async function deleteEntry(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}

export async function clearEntries() {
  await fetch(API, { method: 'DELETE' });
}
