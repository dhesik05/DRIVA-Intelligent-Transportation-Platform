import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, ClipboardList, Truck, Sparkles, Package,
  MapPin, Building2, Users, Briefcase, Activity, DollarSign,
  ShieldCheck, BarChart3, User, Settings as SettingsIcon, Search
} from 'lucide-react';

interface AgencySidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AgencySidebar({ mobileOpen, onMobileClose }: AgencySidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SidebarShell
      roleBadge="Agency Ops"
      roleBadgeVariant="indigo"
      identityTitle={user?.name || 'Logistics Agency'}
      identitySubtitle={user?.email || 'Freight Brokerage Partner'}
      statusText="Verified"
      statusColor="blue"
      quickAction={{
        label: "Match Open Loads",
        icon: Search,
        onClick: () => {
          navigate('/smart-matches');
          onMobileClose?.();
        },
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Main">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Operations">
        <NavItem to="/agency/requests" icon={ClipboardList} label="Transport Requests" onClick={onMobileClose} />
        <NavItem to="/fleet?status=AVAILABLE" icon={Truck} label="Available Capacity" onClick={onMobileClose} />
        <NavItem to="/smart-matches" icon={Sparkles} label="Matching Opportunities" onClick={onMobileClose} />
        <NavItem to="/bookings" icon={Package} label="Bookings" onClick={onMobileClose} />
        <NavItem to="/bookings" icon={MapPin} label="Active Shipments" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Network">
        <NavItem to="/agency/partners" icon={Building2} label="Fleet Partners" onClick={onMobileClose} />
        <NavItem to="/fleet/drivers" icon={Users} label="Drivers" onClick={onMobileClose} />
        <NavItem to="/agency/customers" icon={Briefcase} label="Customers" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Performance">
        <NavItem to="/agency/performance" icon={Activity} label="Delivery Performance" onClick={onMobileClose} />
        <NavItem to="/agency/revenue" icon={DollarSign} label="Revenue" onClick={onMobileClose} />
        <NavItem to="/agency/reliability" icon={ShieldCheck} label="Provider Reliability" onClick={onMobileClose} />
        <NavItem to="/analytics" icon={BarChart3} label="Analytics" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Agency Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
