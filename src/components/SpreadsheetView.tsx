import { useState, useMemo } from 'react';
import type { Entry } from '../api';

interface SpreadsheetViewProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onExportCsv: () => void;
  onEdit: (entry: Entry) => void;
  loading: boolean;
}

export default function SpreadsheetView({ entries, onDelete, onClearAll, onExportCsv, onEdit, loading }: SpreadsheetViewProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const allKeys = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => Object.keys(e.data).forEach(k => set.add(k)));
    return ['Form', 'Submitted', ...set];
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => {
        if (e.form.toLowerCase().includes(q)) return true;
        return Object.values(e.data).some(v => String(v).toLowerCase().includes(q));
      });
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va: string, vb: string;
        if (sortKey === 'Form') { va = a.form; vb = b.form; }
        else if (sortKey === 'Submitted') { va = a.submitted; vb = b.submitted; }
        else { va = String(a.data[sortKey] ?? ''); vb = String(b.data[sortKey] ?? ''); }
        const cmp = va.localeCompare(vb);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [entries, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = useMemo(() => {
    const start = page * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const formatVal = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '\u2014';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  };

  const labelify = (k: string): string => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  return (
    <section className="tab-pane active" id="panel-spreadsheet" role="tabpanel" aria-label="Spreadsheet">
      <h2>All Entries</h2>

      <div className="spreadsheet-controls">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search entries..."
            aria-label="Search entries"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
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
          <>
            <table>
              <thead>
                <tr>
                  {allKeys.map(k => (
                    <th key={k} className="sortable" onClick={() => handleSort(k)}>
                      {labelify(k)}
                      {sortKey === k && <span className="sort-arrow">{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>}
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(entry => (
                  <tr key={entry.id}>
                    {allKeys.map(k => {
                      if (k === 'Submitted') return <td key={k}>{new Date(entry.submitted).toLocaleString()}</td>;
                      if (k === 'Form') return <td key={k}>{entry.form}</td>;
                      return <td key={k}>{formatVal(entry.data[k])}</td>;
                    })}
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => onEdit(entry)}>Edit</button>
                      <button className="delete-btn" onClick={() => onDelete(entry.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(0)}>First</button>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-num${i === page ? ' active' : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>Last</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
