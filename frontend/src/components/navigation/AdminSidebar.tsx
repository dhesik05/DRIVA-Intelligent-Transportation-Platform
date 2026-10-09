import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield, Users, Building2, Truck, Car, Package,
  BarChart3, DollarSign, CreditCard, Activity,
  CheckCircle2, Bell, FileText, User, Settings as SettingsIcon,
  Server, LayoutDashboard, Layers, FileSpreadsheet
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SidebarShell
      roleBadge="Platform Admin"
      roleBadgeVariant="purple"
      identityTitle={user?.name || 'Platform Administrator'}
      identitySubtitle={user?.email || 'Executive Console'}
      statusText="Active"
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
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
        <NavItem to="/admin/users" icon={Users} label="Users" onClick={onMobileClose} />
        <NavItem to="/admin/businesses" icon={Building2} label="Businesses" onClick={onMobileClose} />
        <NavItem to="/admin/fleets" icon={Truck} label="Fleet Owners" onClick={onMobileClose} />
        <NavItem to="/admin/agencies" icon={Layers} label="Logistics Agencies" onClick={onMobileClose} />
        <NavItem to="/admin/drivers" icon={Users} label="Drivers" onClick={onMobileClose} />
        <NavItem to="/admin/vehicles" icon={Car} label="Vehicles" onClick={onMobileClose} />
        <NavItem to="/admin/bookings" icon={Package} label="Bookings" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Monitoring">
        <NavItem to="/analytics" icon={BarChart3} label="Platform Analytics" onClick={onMobileClose} />
        <NavItem to="/admin/requests" icon={FileSpreadsheet} label="Transport Requests" onClick={onMobileClose} />
        <NavItem to="/bookings" icon={Activity} label="Active Deliveries" onClick={onMobileClose} />
        <NavItem to="/admin/health" icon={Server} label="System Health" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Finance">
        <NavItem to="/admin/service-fee" icon={CreditCard} label="Service Fee" onClick={onMobileClose} />
        <NavItem to="/admin/revenue" icon={DollarSign} label="Revenue" onClick={onMobileClose} />
        <NavItem to="/admin/transactions" icon={CreditCard} label="Transactions" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Management">
        <NavItem to="/admin/verification" icon={CheckCircle2} label="Verification" onClick={onMobileClose} />
        <NavItem to="/settings?tab=notifications" icon={Bell} label="Notifications" onClick={onMobileClose} />
        <NavItem to="/admin/reports" icon={FileText} label="Reports" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Admin Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
