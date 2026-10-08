import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarShell, { NavGroup, NavItem } from './SidebarShell';
import {
  Briefcase, MapPin, Navigation, CheckCircle2, DollarSign,
  User, Settings as SettingsIcon, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DriverSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function DriverSidebar({ mobileOpen, onMobileClose }: DriverSidebarProps) {
  const navigate = useNavigate();
  const [onDuty, setOnDuty] = useState(true);

  const toggleDuty = () => {
    setOnDuty(!onDuty);
    toast.success(!onDuty ? 'Status updated: You are now ON DUTY' : 'Status updated: You are now OFF DUTY');
  };

  return (
    <SidebarShell
      roleBadge="Driver Cockpit"
      roleBadgeVariant="emerald"
      identityTitle="Karthik V · Commercial Pilot"
      identitySubtitle="EV Cargo Van (TN-33-AB-1004)"
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
      <NavGroup title="Today's Mission">
        <NavItem to="/driver/jobs" icon={Briefcase} label="My Jobs" badge="1 Active" badgeColor="emerald" onClick={onMobileClose} />
        <NavItem to="/driver/active" icon={MapPin} label="Active Delivery" badge="Live" badgeColor="blue" onClick={onMobileClose} />
        <NavItem to="/driver/route" icon={Navigation} label="Navigation Route" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="History & Pay">
        <NavItem to="/driver/history" icon={CheckCircle2} label="Completed Jobs" onClick={onMobileClose} />
        <NavItem to="/driver/earnings" icon={DollarSign} label="My Earnings" badge="₹2,984" badgeColor="emerald" onClick={onMobileClose} />
      </NavGroup>

      <NavGroup title="Account">
        <NavItem to="/settings?tab=account" icon={User} label="Driver Profile" onClick={onMobileClose} />
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={onMobileClose} />
      </NavGroup>
    </SidebarShell>
  );
}
