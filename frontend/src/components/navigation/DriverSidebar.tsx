import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Briefcase, MapPin, Navigation, CheckCircle2, DollarSign,
  User, Settings as SettingsIcon, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DriverSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function DriverSidebar({ mobileOpen, onMobileClose }: DriverSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [onDuty, setOnDuty] = useState(true);

  const toggleDuty = () => {
    setOnDuty(!onDuty);
    toast.success(!onDuty ? 'Status updated: You are now ON DUTY' : 'Status updated: You are now OFF DUTY');
  };

  return (
    <SidebarShell
      roleBadge="Driver Cockpit"
      roleBadgeVariant="emerald"
      identityTitle={user?.name || 'Commercial Pilot'}
      identitySubtitle={user?.email || 'Driver Account'}
      statusText={onDuty ? "On Duty" : "Off Duty"}
      statusColor={onDuty ? "emerald" : "amber"}
      quickAction={{
        label: onDuty ? "Duty Active (Tap to pause)" : "Go On Duty",
        icon: ShieldCheck,
        onClick: toggleDuty,
      }}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    >
      <NavGroup title="Today">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
        <NavItem to="/driver/jobs" icon={Briefcase} label="My Jobs" onClick={onMobileClose} />
        <NavItem to="/tracking" icon={MapPin} label="Active Delivery" onClick={onMobileClose} />
        <NavItem to="/tracking" icon={Navigation} label="Route" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="History">
        <NavItem to="/bookings" icon={CheckCircle2} label="Completed Jobs" onClick={onMobileClose} />
        <NavItem to="/driver/earnings" icon={DollarSign} label="Earnings" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Driver Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
