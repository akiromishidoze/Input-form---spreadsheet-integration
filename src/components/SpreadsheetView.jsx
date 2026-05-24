import { useState, useMemo } from 'react';

export default function SpreadsheetView({ entries, onDelete, onClearAll, onExportCsv, loading }) {
  const [search, setSearch] = useState('');

  const allKeys = useMemo(() => {
    const set = new Set();
    entries.forEach(e => Object.keys(e.data).forEach(k => set.add(k)));
    return ['Form', 'Submitted', ...set];
  }, [entries]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e => {
      if (e.form.toLowerCase().includes(q)) return true;
      return Object.values(e.data).some(v => String(v).toLowerCase().includes(q));
    });
  }, [entries, search]);

  const formatVal = (v) => {
    if (v === null || v === undefined || v === '') return '\u2014';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  };

  const labelify = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  return (
    <section className="tab-pane active">
      <h2>All Entries</h2>

      <div className="spreadsheet-controls">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={onExportCsv}>Export CSV</button>
        <button className="danger" onClick={onClearAll}>Clear All Data</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="table-status">Loading entries...</div>
        ) : !entries.length ? (
          <div className="table-status">No entries yet.</div>
        ) : !filtered.length ? (
          <div className="table-status">No entries match your search.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {allKeys.map(k => <th key={k}>{labelify(k)}</th>)}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  {allKeys.map(k => {
                    if (k === 'Submitted') return <td key={k}>{new Date(entry.submitted).toLocaleString()}</td>;
                    if (k === 'Form') return <td key={k}>{entry.form}</td>;
                    return <td key={k}>{formatVal(entry.data[k])}</td>;
                  })}
                  <td>
                    <button className="delete-btn" onClick={() => onDelete(entry.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
