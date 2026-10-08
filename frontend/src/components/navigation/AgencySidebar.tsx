import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
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

  return (
    <SidebarShell
      roleBadge="Agency Ops"
      roleBadgeVariant="indigo"
      identityTitle="SouthLine Transport Agency"
      identitySubtitle="Regional Freight Brokerage Network"
      statusText="High Capacity"
      statusColor="blue"
      quickAction={{
        label: "Match Shipments",
        icon: Search,
        onClick: () => {
          navigate('/agency/matching');
          onMobileClose?.();
        },
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Operations">
        <NavItem to="/agency" icon={LayoutDashboard} label="Agency Overview" onClick={onMobileClose} />
        <NavItem to="/agency/requests" icon={ClipboardList} label="Transport Requests" badge="8 New" badgeColor="amber" onClick={onMobileClose} />
        <NavItem to="/agency/capacity" icon={Truck} label="Available Capacity" onClick={onMobileClose} />
        <NavItem to="/agency/matching" icon={Sparkles} label="Matching Opportunities" badge="Live" badgeColor="emerald" onClick={onMobileClose} />
        <NavItem to="/agency/bookings" icon={Package} label="Bookings" onClick={onMobileClose} />
        <NavItem to="/agency/shipments" icon={MapPin} label="Active Shipments" badge="14" badgeColor="blue" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Network">
        <NavItem to="/agency/partners" icon={Building2} label="Fleet Partners" badge="6 Carriers" badgeColor="slate" onClick={onMobileClose} />
        <NavItem to="/agency/drivers" icon={Users} label="Drivers" onClick={onMobileClose} />
        <NavItem to="/agency/customers" icon={Briefcase} label="Corporate Customers" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Performance">
        <NavItem to="/agency/performance" icon={Activity} label="Delivery Performance" badge="98.4%" badgeColor="emerald" onClick={onMobileClose} />
        <NavItem to="/agency/revenue" icon={DollarSign} label="Revenue" onClick={onMobileClose} />
        <NavItem to="/agency/reliability" icon={ShieldCheck} label="Provider Reliability" onClick={onMobileClose} />
        <NavItem to="/agency/analytics" icon={BarChart3} label="Analytics" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Agency Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
