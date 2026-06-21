import Navigation from './Navigation';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  return (
    <header className="app-header-shell">
      <div className="brand">
        <div className="brand-logo" aria-label="SSYロゴ">
          SSY
        </div>
        <div>
          <p className="brand-sub">SSY</p>
          <h1>ShipMate</h1>
        </div>
      </div>
      <Navigation currentPath={currentPath} onNavigate={onNavigate} />
    </header>
  );
}
