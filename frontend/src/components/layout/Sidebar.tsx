import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📁', label: 'Projects', path: '/dashboard/projects' },
  { icon: '⏱', label: 'Run History', path: '/dashboard/history' },
  { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' },
] as const;

function isActivePath(pathname: string, path: string): boolean {
  if (path === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({
  icon,
  label,
  path,
  active,
}: {
  icon: string;
  label: string;
  path: string;
  active: boolean;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex w-full items-center gap-2.5 rounded-none px-3 py-2 text-sm transition-all ${
        active
          ? 'border-r-2 border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]'
          : 'text-[#8a90a0] hover:bg-[#181c24] hover:text-[#e8eaf0]'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex min-w-[220px] flex-col overflow-y-auto border-r border-[rgba(255,255,255,0.07)] bg-[#111318]">
      <div className="border-b border-[rgba(255,255,255,0.07)] px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4f8ef7]" />
          <span className="font-display font-bold text-[#e8eaf0]">DevAssist AI</span>
        </div>
      </div>

      <nav className="flex-1 py-3">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#555d70]">Workspace</p>
        {NAV_ITEMS.slice(0, 3).map((item) => (
          <NavItem key={item.path} {...item} active={isActivePath(pathname, item.path)} />
        ))}

        <p className="mt-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#555d70]">Account</p>
        <NavItem {...NAV_ITEMS[3]} active={isActivePath(pathname, NAV_ITEMS[3].path)} />
      </nav>

      <div className="border-t border-[rgba(255,255,255,0.07)] p-3">
        <div className="flex items-center gap-2 rounded-md p-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c5cf7] text-xs font-semibold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#e8eaf0]">{user?.name}</p>
            <p className="truncate text-[10px] text-[#555d70]">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#8a90a0] transition-colors hover:text-[#e8eaf0]"
        >
          <span>🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
