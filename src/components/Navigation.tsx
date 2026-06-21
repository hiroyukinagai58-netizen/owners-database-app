interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems = [
  { path: '/', label: '会社一覧' },
  { path: '/ships', label: '船舶一覧' },
  { path: '/meetings', label: '面談記録' },
];

export default function Navigation({ currentPath, onNavigate }: NavigationProps) {
  return (
    <nav className="top-nav" aria-label="主要メニュー">
      {navItems.map((item) => {
        const active = currentPath === item.path;
        return (
          <button
            key={item.path}
            type="button"
            className={`nav-link ${active ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
