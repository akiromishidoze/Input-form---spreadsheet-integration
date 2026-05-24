const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/api/entries', (req, res) => {
  const entries = db.getAll().map(e => ({ ...e, data: JSON.parse(e.data) }));
  res.json(entries);
});

app.post('/api/entries', (req, res) => {
  const { form, data, submitted } = req.body;
  if (!form || !data) {
    return res.status(400).json({ error: 'form and data are required' });
  }
  const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const ts = submitted || new Date().toISOString();
  db.add(id, form, data, ts);
  res.status(201).json({ id });
});

app.delete('/api/entries/:id', (req, res) => {
  db.remove(req.params.id);
  res.json({ ok: true });
});

app.delete('/api/entries', (req, res) => {
  db.clearAll();
  res.json({ ok: true });
});

const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
