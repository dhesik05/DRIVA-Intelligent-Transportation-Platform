import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SettingsNavigationPanel, { getRoleSettingsTabs } from '../components/navigation/SettingsPanel';
import {
  User, Building2, Bell, Shield, Sliders, CreditCard,
  Key, Lock, CheckCircle2, Save, Download, Smartphone,
  Mail, Globe, HelpCircle, AlertTriangle, Truck, Users,
  Activity, Server, FileText, Cpu, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const availableTabs = getRoleSettingsTabs(user?.role);
  
  // Initialize tab from URL search params or fallback to first tab
  const defaultTab = availableTabs[0]?.id || 'profile';
  const initialTab = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [saving, setSaving] = useState(false);

  // Sync tab with search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && availableTabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Rajan Logistics Corp',
    email: user?.email || 'rajan@driva.demo',
    phone: '+91 98765 43210',
    company: user?.role === 'FLEET_OWNER' ? 'ABC Logistics Fleet Operations' : user?.role === 'LOGISTICS_AGENCY' ? 'SouthLine Freight Agency' : 'Salem Textiles & Electronics Ltd',
    gstin: '33AABCT1332L1Z5',
    pan: 'AABCT1332L',
    address: '42 Industrial Corridor, Omalur Main Road, Salem, TN 636004',
    city: 'Salem',
    state: 'Tamil Nadu',
    postalCode: '636004',
    licenseNo: 'TN-33-2018-009124',
    emergencyContact: '+91 94432 10987',
  });

  const [transportPrefs, setTransportPrefs] = useState({
    defaultPriority: 'HIGH',
    preferredVehicle: 'Any',
    maxTransitBufferHours: '2',
    autoMatchOnCreate: true,
    requireGpsVerification: true,
    requireCargoInsurance: true,
    autoAssignDrivers: true,
    maxDutyHours: '8',
    prioritizeEV: true,
    agencyMargin: '8.5',
    capacityReserveBuffer: '15',
    corridorRadiusKm: '25',
    baseServiceFeePercent: '5.0',
    gstOnServiceFee: '18',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailMatchAlerts: true,
    emailBookingConfirmation: true,
    emailDeliveryMilestones: true,
    smsDispatchAlerts: true,
    smsArrivalNotification: true,
    weeklySpendDigest: true,
    driverAlerts: true,
    sosEmergency: true,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    driverPin: '8842',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings updated successfully');
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Settings Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Enterprise Configuration
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Role Calibrated Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Settings & Preferences</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure profile credentials, role-specific operational parameters, notifications, and DRIVA service billing.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs self-start sm:self-center"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Dedicated Settings Navigation Panel (Left Column) */}
        <aside className="md:col-span-4 lg:col-span-3">
          <SettingsNavigationPanel
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </aside>

        {/* Selected Settings Content Panel (Right Column) */}
        <main className="md:col-span-8 lg:col-span-9 card p-6 shadow-xs border-slate-200 space-y-6">
          {/* ─────────────────────────────────────────────────────────────
              1. PROFILE / ACCOUNT
          ───────────────────────────────────────────────────────────── */}
          {(activeTab === 'profile' || activeTab === 'account') && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {user?.role === 'DRIVER' ? 'Commercial Pilot Profile' : user?.role === 'FLEET_OWNER' ? 'Fleet Carrier Profile' : user?.role === 'LOGISTICS_AGENCY' ? 'Logistics Agency Profile' : user?.role === 'ADMIN' ? 'Platform Administrator Profile' : 'Company & Shipper Profile'}
                </h2>
                <p className="text-xs text-slate-500">Corporate identity, tax identification, and operational contacts.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Registered Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Primary Phone</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Assigned Role</label>
                  <input
                    type="text"
                    value={user?.role?.replace('_', ' ') || 'BUSINESS OWNER'}
                    disabled
                    className="input-field bg-slate-50 text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>

                {user?.role === 'DRIVER' ? (
                  <>
                    <div>
                      <label className="label">Commercial Driving License No (CDL)</label>
                      <input
                        type="text"
                        value={profileData.licenseNo}
                        onChange={(e) => setProfileData({ ...profileData, licenseNo: e.target.value })}
                        className="input-field font-mono"
                      />
                    </div>
                    <div>
                      <label className="label">Emergency Contact Phone</label>
                      <input
                        type="text"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                        className="input-field font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="label">Registered Corporate Entity / Organization</label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">GSTIN</label>
                      <input
                        type="text"
                        value={profileData.gstin}
                        onChange={(e) => setProfileData({ ...profileData, gstin: e.target.value })}
                        className="input-field font-mono"
                      />
                    </div>
                    <div>
                      <label className="label">PAN</label>
                      <input
                        type="text"
                        value={profileData.pan}
                        onChange={(e) => setProfileData({ ...profileData, pan: e.target.value })}
                        className="input-field font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Operating Facility / Warehouse Address</label>
                      <textarea
                        rows={2}
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              2. DRIVER PREFERENCES (FLEET)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'driver_prefs' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Driver & Dispatch Preferences</h2>
                <p className="text-xs text-slate-500">Configure automated pilot assignments, duty hours, and EV vehicle priority.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Max Daily Continuous Duty Hours</label>
                    <select
                      value={transportPrefs.maxDutyHours}
                      onChange={(e) => setTransportPrefs({ ...transportPrefs, maxDutyHours: e.target.value })}
                      className="input-field"
                    >
                      <option value="6">6 Hours (Light Commercial)</option>
                      <option value="8">8 Hours (Standard Inter-City)</option>
                      <option value="10">10 Hours (Two-Driver Relay)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Dispatch Assignment Mode</label>
                    <select className="input-field">
                      <option value="auto">Auto-Assign Closest Certified Driver</option>
                      <option value="manual">Manual Fleet Supervisor Approval</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transportPrefs.prioritizeEV}
                      onChange={(e) => setTransportPrefs({ ...transportPrefs, prioritizeEV: e.target.checked })}
                      className="rounded text-blue-700"
                    />
                    <span className="text-slate-800 font-medium">Prioritize Zero-Emission EV Cargo Vans for routes &lt; 350 km</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transportPrefs.autoAssignDrivers}
                      onChange={(e) => setTransportPrefs({ ...transportPrefs, autoAssignDrivers: e.target.checked })}
                      className="rounded text-blue-700"
                    />
                    <span className="text-slate-800 font-medium">Enable Geofenced Return-Trip Auto Allocation (reduces empty deadhead miles)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. SERVICE PREFERENCES (AGENCY)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'service_prefs' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Agency Service & Brokerage Preferences</h2>
                <p className="text-xs text-slate-500">Set capacity buffer thresholds, brokerage margins, and SLA standards.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Target Brokerage Margin Rate (%)</label>
                  <input
                    type="number"
                    value={transportPrefs.agencyMargin}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, agencyMargin: e.target.value })}
                    className="input-field font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">DRIVA 5% platform service fee is handled automatically.</p>
                </div>

                <div>
                  <label className="label">Reserve Capacity Buffer (%)</label>
                  <select
                    value={transportPrefs.capacityReserveBuffer}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, capacityReserveBuffer: e.target.value })}
                    className="input-field"
                  >
                    <option value="10">10% Emergency Contingency</option>
                    <option value="15">15% Standard Buffer</option>
                    <option value="20">20% High-Availability Buffer</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4. VEHICLE INFORMATION (DRIVER)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'vehicle_info' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Assigned Vehicle Specifications</h2>
                <p className="text-xs text-slate-500">Chassis telemetry, battery health, and payload ratings for your current unit.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Vehicle Unit</div>
                    <div className="text-base font-bold text-slate-900">EV Cargo Van (TN-33-AB-1004)</div>
                  </div>
                  <span className="badge badge-green">Ready & Inspected</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Max Payload:</span>
                    <div className="font-bold text-slate-800">800 kg</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Usable Dimensions:</span>
                    <div className="font-bold text-slate-800">2.8m × 1.5m × 1.5m</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Battery Health:</span>
                    <div className="font-bold text-emerald-700">99.2% (Healthy)</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Service:</span>
                    <div className="font-bold text-slate-800">12 Days Ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              5. PLATFORM SETTINGS (ADMIN)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'platform' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">System Platform Configuration</h2>
                <p className="text-xs text-slate-500">Corridor geo-fencing radius, ML model inference state, and API engine controls.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Origin Corridor Matching Radius (km)</label>
                  <input
                    type="number"
                    value={transportPrefs.corridorRadiusKm}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, corridorRadiusKm: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="label">Scikit-Learn Machine Learning Pipeline</label>
                  <input
                    type="text"
                    value="v1.0.0 (Cost, ETA, Suitability Models Active)"
                    disabled
                    className="input-field bg-slate-50 font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 mb-1">Active Indian Corridors</div>
                <div className="text-slate-500">
                  NH 44 (Salem ↔ Bangalore), NH 48 (Chennai ↔ Bangalore), NH 544 (Coimbatore ↔ Bangalore), NH 79 (Salem ↔ Chennai)
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              6. SERVICE FEE CONFIGURATION (ADMIN)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'service_fee' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">DRIVA Service Fee Governance</h2>
                <p className="text-xs text-slate-500">
                  Transparent software service fee rules (zero broker commission terminology).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-2">
                <div className="font-bold text-blue-900 text-sm">Policy Notice: Fixed Service Fee Structure</div>
                <p className="text-blue-800">
                  DRIVA uses a transparent <strong>5.0% Platform Service Fee</strong> applied to transacted freight value for automated allocation, ML models, SLA monitoring, and digital proof-of-delivery archival.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Platform Service Fee Rate (%)</label>
                  <input
                    type="number"
                    value={transportPrefs.baseServiceFeePercent}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, baseServiceFeePercent: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="label">GST Rate on Service Fee (%)</label>
                  <input
                    type="number"
                    value={transportPrefs.gstOnServiceFee}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, gstOnServiceFee: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              7. USER GOVERNANCE (ADMIN)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'user_mgmt' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">User Governance & Verification Rules</h2>
                <p className="text-xs text-slate-500">Carrier commercial onboarding checks and enterprise compliance requirements.</p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-700" />
                  <span className="text-slate-800 font-medium">Mandatory Commercial Carrier RC Book & Permit verification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-700" />
                  <span className="text-slate-800 font-medium">Automated GSTIN Validation via National Portal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-700" />
                  <span className="text-slate-800 font-medium">Commercial Driver License (CDL) background verification check</span>
                </label>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              8. PREFERENCES (BUSINESS)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Procurement & Regional Preferences</h2>
                <p className="text-xs text-slate-500">Configure default priorities, chassis preferences, and dimension standards.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Default Dispatch Priority</label>
                  <select
                    value={transportPrefs.defaultPriority}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, defaultPriority: e.target.value })}
                    className="input-field"
                  >
                    <option value="NORMAL">NORMAL (Scheduled)</option>
                    <option value="HIGH">HIGH (Standard Express)</option>
                    <option value="URGENT">URGENT (Dedicated Corridor)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Default Preferred Chassis</label>
                  <select
                    value={transportPrefs.preferredVehicle}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, preferredVehicle: e.target.value })}
                    className="input-field"
                  >
                    <option value="Any">Any Optimal Match (Recommended)</option>
                    <option value="Tata Ace">Tata Ace (750 kg)</option>
                    <option value="Bolero Pickup">Bolero Pickup (1,000 kg)</option>
                    <option value="EV Cargo Van">EV Cargo Van (800 kg)</option>
                    <option value="Mini Truck">Mini Truck (2,500 kg)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transportPrefs.requireGpsVerification}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, requireGpsVerification: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span className="text-slate-700 font-medium">Require GPS-verified vehicles only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transportPrefs.requireCargoInsurance}
                    onChange={(e) => setTransportPrefs({ ...transportPrefs, requireCargoInsurance: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span className="text-slate-700 font-medium">Auto-verify carrier transit liability insurance</span>
                </label>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              9. NOTIFICATIONS (COMMON)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Notifications & Delivery Alerts</h2>
                <p className="text-xs text-slate-500">Configure email, SMS, and operational alert triggers.</p>
              </div>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                <div className="pt-2 space-y-2.5">
                  <h4 className="font-bold text-slate-800">Dispatch & Milestone Triggers</h4>
                  <label className="flex items-center justify-between py-1 cursor-pointer">
                    <div>
                      <div className="text-slate-800 font-semibold">Smart Match Ready Alert</div>
                      <div className="text-[11px] text-slate-400">Receive notification when optimal carriers are ranked</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.emailMatchAlerts}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailMatchAlerts: e.target.checked })}
                      className="rounded text-blue-700"
                    />
                  </label>

                  <label className="flex items-center justify-between py-1 cursor-pointer">
                    <div>
                      <div className="text-slate-800 font-semibold">Consignment Dispatched (SMS)</div>
                      <div className="text-[11px] text-slate-400">SMS trigger when driver initiates highway transit</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.smsDispatchAlerts}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, smsDispatchAlerts: e.target.checked })}
                      className="rounded text-blue-700"
                    />
                  </label>

                  <label className="flex items-center justify-between py-1 cursor-pointer">
                    <div>
                      <div className="text-slate-800 font-semibold">Delivery Complete & Proof of Delivery (POD)</div>
                      <div className="text-[11px] text-slate-400">Immediate PDF delivery receipt sent via email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.emailDeliveryMilestones}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailDeliveryMilestones: e.target.checked })}
                      className="rounded text-blue-700"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              10. SECURITY (COMMON)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Security & Access Governance</h2>
                <p className="text-xs text-slate-500">Manage credentials, active sessions, and multi-factor authentication.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">New Secure Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Two-Factor Authentication (2FA)</div>
                    <div className="text-[11px] text-slate-400">Secure OTP verification on every new session login</div>
                  </div>
                  <span className="badge badge-green font-bold">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              11. BILLING & SERVICE FEES (BUSINESS / FLEET / AGENCY)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'billing' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">DRIVA Service Fee & Invoicing</h2>
                <p className="text-xs text-slate-500">Transparent software service fees, corporate billing ledger, and tax invoices.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400">Platform Pricing Architecture</div>
                    <div className="text-base font-bold text-slate-900">5% DRIVA Service Fee Model</div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    5.0% Fixed Software Fee
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  DRIVA applies a transparent 5% platform software fee to transacted freight value. No hidden broker markups, no opaque spreads.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Recent Corporate Monthly Invoices</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-md text-xs">
                  {[
                    { id: 'INV-2026-10', date: 'October 2026', total: '₹67,000', fee: '₹3,350', status: 'Settled' },
                    { id: 'INV-2026-09', date: 'September 2026', total: '₹51,000', fee: '₹2,550', status: 'Settled' },
                    { id: 'INV-2026-08', date: 'August 2026', total: '₹58,000', fee: '₹2,900', status: 'Settled' },
                  ].map((inv) => (
                    <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{inv.id}</div>
                        <div className="text-[11px] text-slate-400">{inv.date} · Freight: {inv.total} (5% Fee: {inv.fee})</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-green">{inv.status}</span>
                        <button
                          onClick={() => toast.success(`Downloading invoice ${inv.id}`)}
                          className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              12. INTEGRATIONS (BUSINESS)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'integrations' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Connected Services & ERP Integrations</h2>
                <p className="text-xs text-slate-500">Connect DRIVA with SAP, Oracle, Blue Yonder, or custom TMS solutions.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Production REST API Key</span>
                  <button
                    onClick={() => toast.success('API Key copied to clipboard')}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Copy Key
                  </button>
                </div>
                <div className="p-2 bg-white rounded border border-slate-300 font-mono text-[11px] text-slate-700 select-all">
                  drv_live_948f29c108ba43e88701e67041b3df
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              13. PRIVACY & DATA (BUSINESS)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Privacy, Governance & Audit Bundles</h2>
                <p className="text-xs text-slate-500">Export audited transportation records and compliance logs.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Complete Freight Audit Bundle (CSV)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Includes all corridor trips, GPS timestamps, and 5% fee invoices.</div>
                </div>
                <button
                  onClick={() => toast.success('Exporting CSV procurement audit bundle...')}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
