import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  User, Building2, Bell, Shield, Sliders, CreditCard,
  Key, Lock, Truck, Users, Activity, Settings as SettingsIcon,
  HelpCircle, ChevronRight, CheckCircle2
} from 'lucide-react';

export interface SettingsTabItem {
  id: string;
  label: string;
  icon: any;
  desc: string;
  badge?: string;
}

export function getRoleSettingsTabs(role?: string): SettingsTabItem[] {
  switch (role) {
    case 'FLEET_OWNER':
      return [
        { id: 'profile', label: 'Fleet Profile', icon: Building2, desc: 'Carrier identity & operating hub' },
        { id: 'driver_prefs', label: 'Driver Preferences', icon: Users, desc: 'Auto-assignment & duty limits' },
        { id: 'notifications', label: 'Dispatch Alerts', icon: Bell, desc: 'Transport job & vehicle alerts' },
        { id: 'security', label: 'Security & Access', icon: Shield, desc: 'Credentials & fleet permissions' },
        { id: 'billing', label: 'Payouts & Service Fees', icon: CreditCard, desc: 'Carrier payouts & 5% fee records' },
      ];

    case 'LOGISTICS_AGENCY':
      return [
        { id: 'profile', label: 'Agency Profile', icon: Building2, desc: 'Brokerage credentials & license' },
        { id: 'service_prefs', label: 'Service Preferences', icon: Sliders, desc: 'Corridors, capacity & SLA terms' },
        { id: 'notifications', label: 'Brokerage Alerts', icon: Bell, desc: 'Booking & quotation notifications' },
        { id: 'security', label: 'Team & Security', icon: Shield, desc: 'Agent accounts & 2FA protection' },
        { id: 'billing', label: 'Billing & Service Fees', icon: CreditCard, desc: '5% DRIVA Service Fee ledger' },
      ];

    case 'DRIVER':
      return [
        { id: 'profile', label: 'Driver Profile', icon: User, desc: 'Commercial license & contact details' },
        { id: 'vehicle_info', label: 'Vehicle Information', icon: Truck, desc: 'Chassis specs & telemetry readiness' },
        { id: 'notifications', label: 'Job Alerts', icon: Bell, desc: 'Dispatch alerts & route warnings' },
        { id: 'security', label: 'Security & PIN', icon: Shield, desc: 'Driver authentication & PIN' },
      ];

    case 'ADMIN':
      return [
        { id: 'platform', label: 'Platform Settings', icon: SettingsIcon, desc: 'Corridor radius & ML engine config' },
        { id: 'service_fee', label: 'Service Fee Config', icon: CreditCard, desc: '5% DRIVA Service Fee rules' },
        { id: 'user_mgmt', label: 'User Governance', icon: Users, desc: 'Carrier verification requirements' },
        { id: 'notifications', label: 'Platform Broadcasts', icon: Bell, desc: 'System-wide notice triggers' },
        { id: 'security', label: 'Security & Audit', icon: Shield, desc: 'Root keys & API governance' },
      ];

    case 'BUSINESS_OWNER':
    default:
      return [
        { id: 'profile', label: 'Company Profile', icon: Building2, desc: 'Corporate details, GSTIN & PAN' },
        { id: 'preferences', label: 'Procurement Preferences', icon: Sliders, desc: 'Default priority, deadlines & units' },
        { id: 'notifications', label: 'Delivery Alerts', icon: Bell, desc: 'Email, SMS & milestone updates' },
        { id: 'security', label: 'Security & Access', icon: Shield, desc: 'Password & two-factor authentication' },
        { id: 'billing', label: 'Billing & Service Fees', icon: CreditCard, desc: 'Transparent 5% fee & PDF invoices' },
        { id: 'integrations', label: 'Connected Services', icon: Key, desc: 'ERP / TMS webhooks & API keys' },
        { id: 'privacy', label: 'Privacy & Audit', icon: Lock, desc: 'Compliance exports & telemetry retention' },
      ];
  }
}

interface SettingsNavigationPanelProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsNavigationPanel({ activeTab, onTabChange }: SettingsNavigationPanelProps) {
  const { user } = useAuth();
  const tabs = getRoleSettingsTabs(user?.role);

  const roleNameMap: Record<string, string> = {
    BUSINESS_OWNER: 'Corporate Shipper',
    FLEET_OWNER: 'Fleet Operations',
    LOGISTICS_AGENCY: 'Logistics Agency',
    DRIVER: 'Commercial Pilot',
    ADMIN: 'Platform Administrator',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Panel Identity Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-900">Workspace Settings</h2>
        </div>
        <p className="text-[11px] text-slate-500">
          Configuring for <span className="font-semibold text-slate-700">{roleNameMap[user?.role || 'BUSINESS_OWNER']}</span>
        </p>
      </div>

      {/* Tabs List */}
      <nav className="p-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-start gap-3 p-2.5 rounded-md text-left transition-all ${
                isActive
                  ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-md mt-0.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isActive ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-blue-100 text-blue-700 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tab.desc}</p>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 self-center transition-transform ${isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
            </button>
          );
        })}
      </nav>

      {/* Support / Quick Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Need custom ERP setup?</span>
        </div>
        <a href="mailto:support@driva.demo" className="text-[11px] text-blue-700 font-semibold hover:underline block mt-0.5">
          Contact DRIVA Integrations Team
        </a>
      </div>
    </div>
  );
}
