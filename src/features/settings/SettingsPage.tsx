'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Users as UsersIcon,
  Key,
  Globe,
  Database,
  FileText,
  Settings as SettingsIcon,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { UserRole } from '@/lib/role-menus';

interface SettingsPageProps {
  currentRole: UserRole;
}

export default function SettingsPage({ currentRole }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const availableTabs = getAvailableTabs(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-brand-text-secondary">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <nav className="space-y-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id 
                      ? 'bg-brand-accent/20 text-brand-accent' 
                      : 'text-brand-text-secondary hover:bg-brand-hover hover:text-white'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'interest' && <InterestRateSettings />}
          {activeTab === 'roles' && <RolesSettings />}
          {activeTab === 'permissions' && <PermissionsSettings />}
          {activeTab === 'dividends' && <DividendsSettings />}
          {activeTab === 'system' && <SystemSettings />}
          {activeTab === 'audit' && <AuditSettings />}
        </div>
      </div>
    </div>
  );
}

function getAvailableTabs(role: UserRole) {
  const commonTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const roleSpecificTabs: Record<UserRole, any[]> = {
    super_admin: [
      { id: 'roles', label: 'Roles', icon: UsersIcon },
      { id: 'permissions', label: 'Permissions', icon: Key },
      { id: 'interest', label: 'Interest Rates', icon: TrendingUp },
      { id: 'dividends', label: 'Dividends', icon: DollarSign },
      { id: 'system', label: 'System Rules', icon: SettingsIcon },
      { id: 'audit', label: 'Audit Configuration', icon: FileText },
    ],
    administrator: [
      { id: 'interest', label: 'Interest Rates', icon: TrendingUp },
    ],
    fund_manager: [],
    union_rep: [],
    chairperson: [],
    employee: [
      { id: 'password', label: 'Password', icon: Lock },
    ],
  };

  return [...commonTabs, ...(roleSpecificTabs[role] || [])];
}

function ProfileSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-3xl border-2 border-brand-accent">
            JD
          </div>
          <div>
            <button className="px-4 py-2 bg-brand-accent/20 text-brand-accent rounded-lg text-sm font-medium hover:bg-brand-accent/30 transition-all">
              Change Photo
            </button>
            <p className="text-brand-text-secondary text-xs mt-2">JPG, PNG or GIF. Max 2MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="First Name" defaultValue="John" />
          <FormField label="Last Name" defaultValue="Doe" />
          <FormField label="Email" defaultValue="john.doe@gtpea.com" type="email" />
          <FormField label="Phone" defaultValue="+1 234 567 8900" />
          <FormField label="Department" defaultValue="Engineering" />
          <FormField label="Employee ID" defaultValue="EMP-001" disabled />
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        {/* Change Password */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
          <div className="space-y-4">
            <PasswordField label="Current Password" showPassword={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            <PasswordField label="New Password" showPassword={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            <PasswordField label="Confirm New Password" showPassword={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Two-Factor Authentication</h4>
              <p className="text-brand-text-secondary text-sm">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-brand-accent/20 text-brand-accent rounded-lg text-sm font-medium hover:bg-brand-accent/30 transition-all">
              Enable
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Active Sessions</h3>
          <div className="space-y-3">
            <SessionItem device="Chrome on Windows" location="New York, USA" time="Current session" current />
            <SessionItem device="Safari on iPhone" location="New York, USA" time="2 hours ago" />
            <SessionItem device="Firefox on Mac" location="Boston, USA" time="1 day ago" />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function NotificationSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        <NotificationSection
          title="Loan Notifications"
          items={[
            { label: 'Loan application status updates', defaultChecked: true },
            { label: 'Repayment reminders', defaultChecked: true },
            { label: 'Loan approval notifications', defaultChecked: true },
          ]}
        />
        
        <NotificationSection
          title="Savings Notifications"
          items={[
            { label: 'Savings deposit confirmations', defaultChecked: true },
            { label: 'Dividend announcements', defaultChecked: true },
            { label: 'Withdrawal confirmations', defaultChecked: true },
          ]}
        />
        
        <NotificationSection
          title="System Notifications"
          items={[
            { label: 'Security alerts', defaultChecked: true },
            { label: 'Maintenance notices', defaultChecked: false },
            { label: 'Feature updates', defaultChecked: false },
          ]}
        />

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function InterestRateSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Interest Rate Configuration</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField label="Annual Interest Rate (%)" defaultValue="12" suffix="%" />
          <NumberField label="Late Payment Penalty (%)" defaultValue="2" suffix="%" />
          <NumberField label="Minimum Loan Amount ($)" defaultValue="1000" prefix="$" />
          <NumberField label="Maximum Loan Amount ($)" defaultValue="100000" prefix="$" />
        </div>

        <div className="p-4 rounded-lg bg-brand-warning/10 border border-brand-warning/30">
          <p className="text-brand-warning text-sm">
            <strong>Warning:</strong> Changing interest rates will affect all new loan applications. Existing loans will continue with their original rates.
          </p>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function RolesSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Role Management</h2>
      
      <div className="space-y-4">
        {[
          { name: 'Super Admin', count: 2, description: 'Full system access' },
          { name: 'Administrator', count: 5, description: 'Operations management' },
          { name: 'Chairperson', count: 1, description: 'Executive oversight' },
          { name: 'Fund Manager', count: 3, description: 'Financial operations' },
          { name: 'Union Representative', count: 8, description: 'Loan reviews' },
          { name: 'Employee', count: 1247, description: 'Self-service access' },
        ].map((role) => (
          <RoleCard key={role.name} {...role} />
        ))}
      </div>
    </GlassCard>
  );
}

function PermissionsSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Permission Configuration</h2>
      
      <div className="space-y-6">
        {[
          { category: 'Users', permissions: ['Create', 'Read', 'Update', 'Delete'] },
          { category: 'Loans', permissions: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject'] },
          { category: 'Savings', permissions: ['Create', 'Read', 'Update', 'Delete'] },
          { category: 'Reports', permissions: ['Read', 'Export', 'Generate'] },
          { category: 'Settings', permissions: ['Read', 'Update'] },
        ].map((category) => (
          <PermissionCategory key={category.category} {...category} />
        ))}
      </div>
    </GlassCard>
  );
}

function DividendsSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Dividend Configuration</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField label="Dividend Rate (%)" defaultValue="5" suffix="%" />
          <NumberField label="Minimum Savings for Dividend ($)" defaultValue="1000" prefix="$" />
          <SelectField
            label="Distribution Frequency"
            options={['Monthly', 'Quarterly', 'Annually']}
            defaultValue="Quarterly"
          />
          <SelectField
            label="Distribution Method"
            options={['Credit to Savings', 'Bank Transfer', 'Check']}
            defaultValue="Credit to Savings"
          />
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function SystemSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">System Configuration</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Default Currency"
            options={['GHS', 'EUR', 'GBP', 'USD']}
            defaultValue="GHS"
          />
          <SelectField
            label="Timezone"
            options={['UTC', 'GMT', 'EST', 'PST']}
            defaultValue="UTC"
          />
          <SelectField
            label="Date Format"
            options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
            defaultValue="MM/DD/YYYY"
          />
          <NumberField label="Session Timeout (minutes)" defaultValue="30" />
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function AuditSettings() {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Audit Configuration</h2>
      
      <div className="space-y-6">
        <ToggleField
          label="Enable Audit Logging"
          description="Log all system activities for security and compliance"
          defaultChecked={true}
        />
        
        <ToggleField
          label="Log User Login/Logout"
          description="Track user authentication events"
          defaultChecked={true}
        />
        
        <ToggleField
          label="Log Data Changes"
          description="Track all modifications to sensitive data"
          defaultChecked={true}
        />
        
        <ToggleField
          label="Log API Requests"
          description="Track all API calls and responses"
          defaultChecked={false}
        />

        <NumberField label="Log Retention Period (days)" defaultValue="90" />

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// Helper Components
function FormField({ label, defaultValue, type = 'text', disabled = false }: any) {
  return (
    <div>
      <label className="block text-brand-text-secondary text-sm mb-2">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-brand-card-bg border border-brand-card-border rounded-lg text-white focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all disabled:opacity-50"
      />
    </div>
  );
}

function PasswordField({ label, showPassword, onToggle }: any) {
  return (
    <div>
      <label className="block text-brand-text-secondary text-sm mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full px-4 py-2.5 bg-brand-card-bg border border-brand-card-border rounded-lg text-white focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all pr-12"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-white transition-all"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

function NumberField({ label, defaultValue, prefix = '', suffix = '' }: any) {
  return (
    <div>
      <label className="block text-brand-text-secondary text-sm mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary">{prefix}</span>}
        <input
          type="number"
          defaultValue={defaultValue}
          className={`w-full px-4 py-2.5 bg-brand-card-bg border border-brand-card-border rounded-lg text-white focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, options, defaultValue }: any) {
  return (
    <div>
      <label className="block text-brand-text-secondary text-sm mb-2">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 bg-brand-card-bg border border-brand-card-border rounded-lg text-white focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({ label, description, defaultChecked }: any) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-brand-text-secondary text-sm">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full transition-all ${checked ? 'bg-brand-accent' : 'bg-brand-card-border'}`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-all ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function NotificationSection({ title, items }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <h4 className="text-white font-medium mb-4">{title}</h4>
      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-brand-text-secondary text-sm">{item.label}</span>
            <button
              className={`w-10 h-5 rounded-full transition-all ${item.defaultChecked ? 'bg-brand-accent' : 'bg-brand-card-border'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-all ${item.defaultChecked ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionItem({ device, location, time, current }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${current ? 'bg-brand-accent/10 border border-brand-accent/30' : 'bg-brand-card-bg border border-brand-card-border'}`}>
      <div>
        <p className="text-white font-medium text-sm">{device}</p>
        <p className="text-brand-text-secondary text-xs">{location} • {time}</p>
      </div>
      {!current && (
        <button className="text-brand-danger text-sm hover:text-brand-danger/80 transition-all">
          Revoke
        </button>
      )}
    </div>
  );
}

function RoleCard({ name, count, description }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg border border-brand-card-border hover:bg-brand-hover transition-all">
      <div>
        <p className="text-white font-medium">{name}</p>
        <p className="text-brand-text-secondary text-sm">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-brand-accent font-bold">{count}</span>
        <button className="p-2 rounded-lg bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30 transition-all">
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PermissionCategory({ category, permissions }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <h4 className="text-white font-medium mb-4">{category}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {permissions.map((permission: string) => (
          <label key={permission} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-brand-card-border text-brand-accent focus:ring-brand-accent" />
            <span className="text-brand-text-secondary text-sm">{permission}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
