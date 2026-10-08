import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Sparkles,
  Package, MapPin, Compass, BarChart3, History, TrendingUp,
  Bot, Bell, User, Settings as SettingsIcon
} from 'lucide-react';

interface BusinessSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function BusinessSidebar({ mobileOpen, onMobileClose }: BusinessSidebarProps) {
  const navigate = useNavigate();

  return (
    <SidebarShell
      roleBadge="Procurement"
      roleBadgeVariant="blue"
      identityTitle="Enterprise Shipper"
      identitySubtitle="Salem Electronics & Industrial"
      statusText="Active"
      statusColor="emerald"
      quickAction={{
        label: "New Transport Request",
        icon: PlusCircle,
        onClick: () => {
          navigate('/create-request');
          onMobileClose?.();
        },
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Main">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
        <NavItem to="/create-request" icon={PlusCircle} label="New Request" onClick={onMobileClose} />
        <NavItem to="/my-requests" icon={ClipboardList} label="My Requests" badge="Active" badgeColor="blue" onClick={onMobileClose} />
        <NavItem to="/smart-matches" icon={Sparkles} label="Smart Matches" onClick={onMobileClose} />
        <NavItem to="/bookings" icon={Package} label="Bookings" onClick={onMobileClose} />
        <NavItem to="/active-deliveries" icon={MapPin} label="Active Deliveries" badge="Live" badgeColor="emerald" onClick={onMobileClose} />
        <NavItem to="/tracking" icon={Compass} label="Tracking" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Insights">
        <NavItem to="/analytics" icon={BarChart3} label="Cost Analytics" onClick={onMobileClose} />
        <NavItem to="/history" icon={History} label="Transport History" onClick={onMobileClose} />
        <NavItem to="/analytics?tab=providers" icon={TrendingUp} label="Provider Performance" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Tools">
        <NavItem to="/ai-assistant" icon={Bot} label="AI Decision Assistant" badge="Groq" badgeColor="amber" onClick={onMobileClose} />
        <NavItem to="/settings?tab=notifications" icon={Bell} label="Notifications" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
