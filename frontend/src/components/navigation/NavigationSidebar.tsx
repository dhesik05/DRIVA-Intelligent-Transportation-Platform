import { useAuth } from '../../hooks/useAuth';
import BusinessSidebar from './BusinessSidebar';
import FleetSidebar from './FleetSidebar';
import AgencySidebar from './AgencySidebar';
import DriverSidebar from './DriverSidebar';
import AdminSidebar from './AdminSidebar';

interface NavigationSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function NavigationSidebar({ mobileOpen, onMobileClose }: NavigationSidebarProps) {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case 'FLEET_OWNER':
      return <FleetSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
    case 'LOGISTICS_AGENCY':
      return <AgencySidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
    case 'DRIVER':
      return <DriverSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
    case 'ADMIN':
      return <AdminSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
    case 'BUSINESS_OWNER':
    default:
      return <BusinessSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
  }
}
