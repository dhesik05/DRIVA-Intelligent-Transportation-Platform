import { type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, X, ChevronRight } from 'lucide-react';

export interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  badge?: string | number;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate' | 'red';
  onClick?: () => void;
}

export function NavItem({ to, icon: Icon, label, badge, badgeColor = 'blue', onClick }: NavItemProps) {
  const location = useLocation();
  // Check active for exact match or path prefix (unless root dashboard)
  const isBasePath = to === '/dashboard' || to === '/admin' || to === '/fleet' || to === '/agency' || to === '/driver';
  const isActive = isBasePath 
    ? location.pathname === to 
    : location.pathname === to || location.pathname.startsWith(to + '/') || (location.pathname + location.search) === to;

  const badgeColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-700 text-slate-300 border-slate-600',
    red: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
        isActive
          ? 'bg-blue-600 text-white shadow-xs font-semibold'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
        }`} />
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-medium ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function NavGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-3 pb-1">
      <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>{title}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export interface SidebarShellProps {
  roleBadge: string;
  roleBadgeVariant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'indigo';
  identityTitle: string;
  identitySubtitle: string;
  statusText?: string;
  statusColor?: 'emerald' | 'amber' | 'blue';
  quickAction?: {
    label: string;
    icon: any;
    onClick: () => void;
  };
  children: ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function SidebarShell({
  roleBadge,
  roleBadgeVariant = 'blue',
  identityTitle,
  identitySubtitle,
  statusText,
  statusColor = 'emerald',
  quickAction,
  children,
  mobileOpen = false,
  onMobileClose,
}: SidebarShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const badgeVariants: Record<string, string> = {
    blue: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    indigo: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
  };

  const statusIndicatorColors: Record<string, string> = {
    emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    blue: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="DRIVA"
            className="w-8 h-8 rounded-md bg-white object-contain p-0.5 shadow-xs transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-black text-white text-base tracking-tight leading-none">DRIVA</span>
            <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded border mt-0.5 inline-block w-fit ${badgeVariants[roleBadgeVariant]}`}>
              {roleBadge}
            </span>
          </div>
        </button>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Identity Card */}
      <div className="px-3 pt-3 pb-2">
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-md p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-white truncate">{identityTitle}</span>
            {statusText && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${statusIndicatorColors[statusColor]}`} />
                {statusText}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{identitySubtitle}</div>

          {quickAction && (
            <button
              onClick={quickAction.onClick}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
            >
              <quickAction.icon className="w-3.5 h-3.5" />
              <span>{quickAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {children}
      </nav>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2 px-1">
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 min-w-0 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'authenticated'}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open Settings"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-md w-full transition-colors border border-transparent hover:border-rose-900/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col h-full border-r border-slate-800 z-30">
        {content}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <aside className="relative flex flex-col w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
