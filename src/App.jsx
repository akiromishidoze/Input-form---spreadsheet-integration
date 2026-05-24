import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CustomerForm from './components/CustomerForm';
import SpreadsheetView from './components/SpreadsheetView';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import { fetchEntries, addEntry, deleteEntry, clearEntries } from './api';

const STORAGE_KEY = 'multiFormData';

const PENDING_KEY = 'pendingEntries';

export default function App() {
  const [activeTab, setActiveTab] = useState('customer');
  const [entries, setEntries] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      await syncPending();
    } catch (err) {
      console.warn('Server fetch failed, loading from cache:', err);
      showToast('Server unreachable, showing cached data', 'error');
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setEntries(cached);
    }
    setLoading(false);
  }, [showToast]);

  async function syncPending() {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
    if (!pending.length) return;
    const remaining = [];
    for (const entry of pending) {
      try {
        const result = await addEntry(entry.form, entry.data);
        setEntries(prev => {
          const filtered = prev.filter(e => e.id !== entry.id);
          return [result, ...filtered];
        });
      } catch {
        remaining.push(entry);
      }
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
    if (remaining.length) {
      showToast(`${remaining.length} pending entries waiting to sync`, 'error');
    }
  }

  useEffect(() => { loadFromServer(); }, [loadFromServer]);

  const handleSubmit = useCallback(async (formName, data) => {
    setSubmitting(true);
    try {
      const entry = await addEntry(formName, data);
      setEntries(prev => [entry, ...prev]);
      showToast(`${formName} saved!`);
      setSubmitting(false);
      return;
    } catch (err) {
      console.warn('Server save failed:', err);
    }
    setSubmitting(false);
    const fallback = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      form: formName,
      data: { ...data },
      submitted: new Date().toISOString(),
    };
    setEntries(prev => [fallback, ...prev]);
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
    pending.push(fallback);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    showToast('Server save failed, saved locally', 'error');
  }, [showToast]);

  const handleDelete = useCallback(async (id) => {
    setConfirm({
      message: 'Delete this entry?',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteEntry(id);
          setEntries(prev => prev.filter(e => e.id !== id));
          showToast('Entry deleted.');
        } catch (err) {
          console.warn('Delete failed:', err);
          showToast('Delete failed', 'error');
        }
      },
      onCancel: () => setConfirm(null),
    });
  }, [showToast]);

  const handleClearAll = useCallback(async () => {
    if (!entries.length) return;
    setConfirm({
      message: 'Delete ALL entries? This cannot be undone.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await clearEntries();
          setEntries([]);
          showToast('All data cleared.');
        } catch (err) {
          console.warn('Clear failed:', err);
          showToast('Clear failed', 'error');
        }
      },
      onCancel: () => setConfirm(null),
    });
  }, [entries, showToast]);

  const handleExportCsv = useCallback(() => {
    if (!entries.length) {
      showToast('No data to export.', 'error');
      return;
    }
    const headers = ['Form', 'Submitted', ...new Set(entries.flatMap(e => Object.keys(e.data)))];
    const csvRows = [headers.join(',')];
    entries.forEach(e => {
      const row = headers.map(h => {
        if (h === 'Form') return e.form;
        if (h === 'Submitted') return e.submitted;
        const val = e.data[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FormData_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSV exported!');
  }, [entries, showToast]);

  const tabs = {
    customer: <CustomerForm onSubmit={handleSubmit} submitting={submitting} />,
    spreadsheet: (
      <SpreadsheetView
        entries={entries}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onExportCsv={handleExportCsv}
        loading={loading}
      />
    ),
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(v => !v)}
      />
      <div className="main-area" role="main">
        <header>
          <h1>Multi-Form &amp; Spreadsheet Dashboard</h1>
        </header>
        <div className="tab-content">{tabs[activeTab]}</div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}
