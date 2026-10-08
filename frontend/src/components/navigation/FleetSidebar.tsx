import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import {
  Car, CheckCircle2, Layers, ClipboardList, Briefcase,
  MapPin, Users, PieChart, DollarSign, BarChart3,
  User, Settings as SettingsIcon, PlusCircle, LayoutDashboard
} from 'lucide-react';

interface FleetSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function FleetSidebar({ mobileOpen, onMobileClose }: FleetSidebarProps) {
  const navigate = useNavigate();

  return (
    <SidebarShell
      roleBadge="Fleet Ops"
      roleBadgeVariant="amber"
      identityTitle="ABC Logistics Fleet"
      identitySubtitle="15 Commercial Vehicles · Verified"
      statusText="12 Active"
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
      <NavGroup title="Fleet">
        <NavItem to="/fleet" icon={LayoutDashboard} label="Fleet Overview" onClick={onMobileClose} />
        <NavItem to="/fleet/vehicles" icon={Car} label="Vehicles" badge="15" badgeColor="slate" onClick={onMobileClose} />
        <NavItem to="/fleet/availability" icon={CheckCircle2} label="Vehicle Availability" badge="9 Ready" badgeColor="emerald" onClick={onMobileClose} />
        <NavItem to="/fleet/allocation" icon={Layers} label="Vehicle Allocation" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Operations">
        <NavItem to="/fleet/requests" icon={ClipboardList} label="Transport Requests" onClick={onMobileClose} />
        <NavItem to="/fleet/jobs" icon={Briefcase} label="Assigned Jobs" badge="5" badgeColor="blue" onClick={onMobileClose} />
        <NavItem to="/fleet/deliveries" icon={MapPin} label="Active Deliveries" onClick={onMobileClose} />
        <NavItem to="/fleet/drivers" icon={Users} label="Drivers" badge="12" badgeColor="slate" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Performance">
        <NavItem to="/fleet/utilization" icon={PieChart} label="Fleet Utilization" badge="73%" badgeColor="blue" onClick={onMobileClose} />
        <NavItem to="/fleet/earnings" icon={DollarSign} label="Earnings" onClick={onMobileClose} />
        <NavItem to="/fleet/analytics" icon={BarChart3} label="Performance Analytics" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Fleet Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
