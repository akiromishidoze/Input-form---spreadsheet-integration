import { useRef, useEffect, ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'customer',
    label: 'Customer Details',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'spreadsheet',
    label: 'Spreadsheet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle, darkMode, onToggleDark, onLogout, mobileOpen, onMobileToggle }: SidebarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !collapsed) {
        onToggle();
        toggleBtnRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const current = document.activeElement;
        const next = current === last ? first : current?.nextElementSibling || first;
        (next as HTMLElement)?.focus();
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const current = document.activeElement;
        const prev = current === first ? last : current?.previousElementSibling || last;
        (prev as HTMLElement)?.focus();
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [collapsed, onToggle]);

  return (
    <nav
      className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="sidebar-header">
        <button
          className="sidebar-hamburger"
          onClick={onMobileToggle}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          {!collapsed && <span>Forms</span>}
        </div>
        <button
          ref={toggleBtnRef}
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
          </svg>
        </button>
      </div>

      <div className="sidebar-nav" ref={navRef} role="tablist" aria-label="Tabs">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => {
              onTabChange(item.id);
              if (collapsed) onToggle();
            }}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={activeTab === item.id ? 0 : -1}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {darkMode ? (
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            )}
          </svg>
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          className="theme-toggle logout-btn"
          onClick={onLogout}
          aria-label="Logout"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onMobileToggle} />}
    </nav>
  );
}
