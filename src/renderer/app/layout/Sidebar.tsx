import type { AppView } from '../App';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const items: Array<{ key: AppView; label: string; hint: string }> = [
  { key: 'invoices', label: 'Invoices', hint: 'Browse saved invoices' },
  { key: 'timesheets', label: 'Timesheets', hint: 'Track monthly working time' },
  { key: 'clients', label: 'Clients', hint: 'Manage customer records' },
  { key: 'company', label: 'Company', hint: 'Issuer profile and banking data' }
];

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>Invoice&Timesheet App</h1>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === activeView ? 'nav-item nav-item--active' : 'nav-item'}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-item__label">{item.label}</span>
            <span className="nav-item__hint">{item.hint}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
