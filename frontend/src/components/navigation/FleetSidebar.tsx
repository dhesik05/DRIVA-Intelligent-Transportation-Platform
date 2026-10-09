import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import { useAuth } from '../../hooks/useAuth';
import {
  Car, CheckCircle2, Layers, ClipboardList, Briefcase,
  MapPin, Users, PieChart, DollarSign, BarChart3,
  User, Settings as SettingsIcon, PlusCircle, LayoutDashboard,
  ShieldCheck, Activity
} from 'lucide-react';

interface FleetSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function FleetSidebar({ mobileOpen, onMobileClose }: FleetSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SidebarShell
      roleBadge="Fleet Ops"
      roleBadgeVariant="amber"
      identityTitle={user?.name || 'Fleet Partner'}
      identitySubtitle={user?.email || 'Commercial Fleet Account'}
      statusText="Verified"
      statusColor="emerald"
      quickAction={{
        label: "Register Vehicle",
        icon: PlusCircle,
        onClick: () => {
          navigate('/fleet?action=register');
          onMobileClose?.();
        },
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Main">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Fleet">
        <NavItem to="/fleet" icon={LayoutDashboard} label="Fleet Overview" onClick={onMobileClose} />
        <NavItem to="/fleet" icon={Car} label="Vehicles" onClick={onMobileClose} />
        <NavItem to="/fleet?status=AVAILABLE" icon={CheckCircle2} label="Vehicle Availability" onClick={onMobileClose} />
        <NavItem to="/fleet?status=ASSIGNED" icon={Layers} label="Vehicle Allocation" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Operations">
        <NavItem to="/fleet/requests" icon={ClipboardList} label="Transport Requests" onClick={onMobileClose} />
        <NavItem to="/fleet/jobs" icon={Briefcase} label="Assigned Jobs" onClick={onMobileClose} />
        <NavItem to="/fleet/deliveries" icon={MapPin} label="Active Deliveries" onClick={onMobileClose} />
        <NavItem to="/fleet/drivers" icon={Users} label="Drivers" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Performance">
        <NavItem to="/fleet/utilization" icon={PieChart} label="Fleet Utilization" onClick={onMobileClose} />
        <NavItem to="/fleet/earnings" icon={DollarSign} label="Earnings" onClick={onMobileClose} />
        <NavItem to="/fleet/performance" icon={Activity} label="Delivery Performance" onClick={onMobileClose} />
        <NavItem to="/analytics" icon={BarChart3} label="Analytics" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Fleet Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
