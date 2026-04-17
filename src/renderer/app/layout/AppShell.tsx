import type { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AppView } from '../App';

interface AppShellProps extends PropsWithChildren {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="app-shell__content">
        <Header />
        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  );
}
