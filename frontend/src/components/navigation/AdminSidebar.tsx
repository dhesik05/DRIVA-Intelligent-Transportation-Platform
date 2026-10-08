import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import {
  Shield, Users, Building2, Truck, Car, Package,
  BarChart3, DollarSign, CreditCard, Activity,
  CheckCircle2, Bell, FileText, User, Settings as SettingsIcon,
  Server
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <SidebarShell
      roleBadge="Platform Admin"
      roleBadgeVariant="purple"
      identityTitle="Executive Administration"
      identitySubtitle="DRIVA Governance Console"
      statusText="99.98% SLA"
      statusColor="emerald"
      quickAction={{
        label: "System Health Monitor",
        icon: Server,
        onClick: () => {
          navigate('/admin/health');
          onMobileClose?.();
        },
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Platform">
        <NavItem to="/admin" icon={Shield} label="Overview" onClick={onMobileClose} />
        <NavItem to="/admin/users" icon={Users} label="Users" badge="38" badgeColor="slate" onClick={onMobileClose} />
        <NavItem to="/admin/businesses" icon={Building2} label="Businesses" onClick={onMobileClose} />
        <NavItem to="/admin/providers" icon={Truck} label="Providers" onClick={onMobileClose} />
        <NavItem to="/admin/fleet" icon={Car} label="Fleet Registry" onClick={onMobileClose} />
        <NavItem to="/admin/bookings" icon={Package} label="Consignment Bookings" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Monitoring & Finance">
        <NavItem to="/admin/analytics" icon={BarChart3} label="Platform Analytics" onClick={onMobileClose} />
        <NavItem to="/admin/revenue" icon={DollarSign} label="Platform GMV" onClick={onMobileClose} />
        <NavItem to="/admin/service-fee" icon={CreditCard} label="DRIVA Service Fee (5%)" badge="Live" badgeColor="blue" onClick={onMobileClose} />
        <NavItem to="/admin/health" icon={Activity} label="System Health" badge="OK" badgeColor="emerald" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Management">
        <NavItem to="/admin/verification" icon={CheckCircle2} label="Carrier Verification" badge="2 Pending" badgeColor="amber" onClick={onMobileClose} />
        <NavItem to="/admin/notifications" icon={Bell} label="Platform Alerts" onClick={onMobileClose} />
        <NavItem to="/admin/reports" icon={FileText} label="Executive Reports" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Admin Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
