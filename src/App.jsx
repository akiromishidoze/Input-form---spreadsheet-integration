import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import PersonalForm from './components/PersonalForm';
import EmployeeForm from './components/EmployeeForm';
import AddressForm from './components/AddressForm';
import FeedbackForm from './components/FeedbackForm';
import SpreadsheetView from './components/SpreadsheetView';
import Toast from './components/Toast';
import { fetchEntries, addEntry, deleteEntry, clearEntries } from './api';

const STORAGE_KEY = 'multiFormData';

export default function App() {
  const [activeTab, setActiveTab] = useState('personal');
  const [entries, setEntries] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const loadFromServer = useCallback(async () => {
    try {
      const data = await fetchEntries();
      setEntries(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setEntries(cached);
    }
  }, []);

  useEffect(() => { loadFromServer(); }, [loadFromServer]);

  const handleSubmit = useCallback(async (formName, data) => {
    try {
      const entry = await addEntry(formName, data);
      setEntries(prev => [entry, ...prev]);
    } catch {
      const fallback = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        form: formName,
        data: { ...data },
        submitted: new Date().toISOString(),
      };
      setEntries(prev => [fallback, ...prev]);
      showToast('Server save failed, saved locally', 'error');
    }
    showToast(`${formName} saved!`);
  }, [showToast]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteEntry(id);
    } catch {
      /* ok */
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    showToast('Entry deleted.');
  }, [showToast]);

  const handleClearAll = useCallback(async () => {
    if (!entries.length) return;
    if (!confirm('Delete ALL entries?')) return;
    try {
      await clearEntries();
    } catch {
      /* ok */
    }
    setEntries([]);
    showToast('All data cleared.');
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
    personal: <PersonalForm onSubmit={handleSubmit} />,
    employee: <EmployeeForm onSubmit={handleSubmit} />,
    address: <AddressForm onSubmit={handleSubmit} />,
    feedback: <FeedbackForm onSubmit={handleSubmit} />,
    spreadsheet: (
      <SpreadsheetView
        entries={entries}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onExportCsv={handleExportCsv}
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
      />
      <div className="main-area">
        <header>
          <h1>Multi-Form &amp; Spreadsheet Dashboard</h1>
        </header>
        <main className="tab-content">{tabs[activeTab]}</main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
