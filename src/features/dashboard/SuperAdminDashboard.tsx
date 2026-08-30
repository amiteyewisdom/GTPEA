'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  Users,
  PiggyBank,
  BadgeCent,
  Wallet,
  CheckCircle,
  TrendingUp,
  Activity,
  Clock,
  Shield,
  Settings,
  UserPlus,
  Lock,
  AlertTriangle,
  Database,
  Key,
  Trash2,
  Edit,
  Eye,
  X,
  Ban,
  ShieldCheck,
  UserX,
  MoreVertical,
  Upload,
  FileText,
  Download
} from 'lucide-react';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCompact, formatCurrency, formatNumber } from '@/utils/formatters';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function ConfigItem({ icon: Icon, title, description, status }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-hover hover:bg-brand-hover/80 transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-2">
        <Icon className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-brand-text text-sm font-medium">{title}</h4>
          <p className="text-brand-text-secondary text-xs mt-1">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-green" />
        <span className="text-brand-text-secondary text-xs">{status}</span>
      </div>
    </div>
  );
}

function UserActionsDropdown({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState<{ action: string; userId: string } | null>(null);

  const handleAction = (action: string) => {
    setShowConfirm({ action, userId });
    setIsOpen(false);
  };

  const confirmAction = async () => {
    if (!showConfirm) return;

    try {
      const response = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showConfirm.userId,
          action: showConfirm.action,
        }),
      });

      if (response.ok) {
        setShowConfirm(null);
        // Refresh user list
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const actionItems = [
    { icon: Ban, label: 'Suspend', action: 'suspend', color: 'text-brand-warning' },
    { icon: ShieldCheck, label: 'Unsuspend', action: 'unsuspend', color: 'text-brand-green' },
    { icon: UserX, label: 'Revoke Role', action: 'revoke_role', color: 'text-brand-danger' },
    { icon: Trash2, label: 'Delete User', action: 'delete', color: 'text-brand-danger' },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-brand-hover rounded-lg transition-all"
        >
          <MoreVertical className="w-4 h-4 text-brand-text-secondary" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            {actionItems.map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-all"
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to {showConfirm.action.replace('_', ' ')} this user? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-brand-danger text-white rounded-lg hover:bg-brand-danger/90 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmergencyButton({ icon: Icon, title, description, variant }: any) {
  const variantStyles = {
    danger: 'bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 border-brand-danger/30',
    warning: 'bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/20 border-brand-warning/30',
  };

  return (
    <button className={`p-4 rounded-lg border transition-all ${variantStyles[variant as keyof typeof variantStyles]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </button>
  );
}

function UserActionsDropdown({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState<{ action: string; userId: string } | null>(null);

  const handleAction = (action: string) => {
    setShowConfirm({ action, userId });
    setIsOpen(false);
  };

  const confirmAction = async () => {
    if (!showConfirm) return;

    try {
      const response = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showConfirm.userId,
          action: showConfirm.action,
        }),
      });

      if (response.ok) {
        setShowConfirm(null);
        // Refresh user list
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const actionItems = [
    { icon: Ban, label: 'Suspend', action: 'suspend', color: 'text-brand-warning' },
    { icon: ShieldCheck, label: 'Unsuspend', action: 'unsuspend', color: 'text-brand-green' },
    { icon: UserX, label: 'Revoke Role', action: 'revoke_role', color: 'text-brand-danger' },
    { icon: Trash2, label: 'Delete User', action: 'delete', color: 'text-brand-danger' },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-brand-hover rounded-lg transition-all"
        >
          <MoreVertical className="w-4 h-4 text-brand-text-secondary" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            {actionItems.map((item) => (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-all"
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to {showConfirm.action.replace('_', ' ')} this user? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-brand-danger text-white rounded-lg hover:bg-brand-danger/90 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(1); // Skip header
        const data = lines
          .filter(line => line.trim())
          .map(line => {
            const [employee_no, email, phone_number, first_name, last_name] = line.split(',').map(s => s.trim());
            return { employee_no, email, phone_number, first_name, last_name };
          });
        setPreview(data.slice(0, 5)); // Show first 5 rows
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import-employees', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onClose();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to import employees:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Employees</h3>
              <p className="text-sm text-gray-600 mt-1">Upload CSV file with employee data</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop CSV file here, or click to select
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent/90 cursor-pointer"
            >
              Select File
            </label>
            <p className="text-xs text-gray-500 mt-2">
              CSV format: employee_no, email, phone_number, first_name, last_name
            </p>
          </div>

          {file && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected: {file.name}</p>
              {preview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2">Employee No</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Phone</th>
                          <th className="text-left py-2 px-2">First Name</th>
                          <th className="text-left py-2 px-2">Last Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 px-2">{row.employee_no}</td>
                            <td className="py-2 px-2">{row.email}</td>
                            <td className="py-2 px-2">{row.phone_number}</td>
                            <td className="py-2 px-2">{row.first_name}</td>
                            <td className="py-2 px-2">{row.last_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Importing...' : 'Import Employees'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingEmployeesTable() {
  const [pendingEmployees, setPendingEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchPendingEmployees = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pending-employees');
      const data = await response.json();
      if (response.ok) {
        setPendingEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending employees:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingEmployees();
  }, [fetchPendingEmployees]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/admin/pending-employees/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (response.ok) {
        fetchPendingEmployees();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-brand-text-secondary">Loading pending employees...</div>;
  }

  if (pendingEmployees.length === 0) {
    return <div className="text-center py-8 text-brand-text-secondary">No pending employee approvals</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-card-border">
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Employee No</th>
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Name</th>
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Email</th>
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Phone</th>
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Imported At</th>
            <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingEmployees.map((emp) => (
            <tr key={emp.id} className="border-b border-brand-card-border">
              <td className="py-3 px-4 text-brand-text text-sm">{emp.employee_no}</td>
              <td className="py-3 px-4 text-brand-text text-sm">
                {emp.first_name} {emp.last_name}
              </td>
              <td className="py-3 px-4 text-brand-text text-sm">{emp.email}</td>
              <td className="py-3 px-4 text-brand-text text-sm">{emp.phone_number}</td>
              <td className="py-3 px-4 text-brand-text-secondary text-sm">
                {new Date(emp.imported_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(emp.id, 'approve')}
                    disabled={actionLoading === emp.id}
                    className="px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-lg text-xs font-medium hover:bg-brand-green/20 transition-all disabled:opacity-50"
                  >
                    {actionLoading === emp.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(emp.id, 'reject')}
                    disabled={actionLoading === emp.id}
                    className="px-3 py-1.5 bg-brand-danger/10 text-brand-danger rounded-lg text-xs font-medium hover:bg-brand-danger/20 transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinancialDataModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = React.useState<'savings' | 'loans'>('savings');
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [importType, setImportType] = React.useState<'savings' | 'loans'>('savings');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = importType === 'savings' 
        ? '/api/admin/import-savings' 
        : '/api/admin/import-loans';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Import completed: ${data.message}`);
        setFile(null);
      }
    } catch (error) {
      console.error('Failed to import:', error);
      alert('Import failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endpoint = activeTab === 'savings' 
        ? '/api/admin/export-savings' 
        : '/api/admin/export-loans';

      const response = await fetch(endpoint);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Data Import/Export</h3>
              <p className="text-sm text-gray-600 mt-1">Import or export savings and loan data</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'savings' 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'loans' 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Loans
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Data</h4>
            <p className="text-xs text-gray-600 mb-3">
              Download all {activeTab} data as CSV file with employee information
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-all"
            >
              <Download className="w-4 h-4" />
              Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Data</h4>
            <p className="text-xs text-gray-600 mb-3">
              Upload CSV file to update or create {activeTab} records
            </p>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                CSV Format for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </label>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                {activeTab === 'savings' 
                  ? 'employee_no, type, balance, monthly_contribution, interest_rate, account_number'
                  : 'employee_no, loan_ref, amount_requested, amount_approved, interest_rate, term_months, purpose, status'
                }
              </code>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="financial-file-upload"
              />
              <label
                htmlFor="financial-file-upload"
                className="inline-block px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent/90 cursor-pointer"
              >
                Select CSV File
              </label>
              {file && (
                <p className="text-xs text-gray-600 mt-2">Selected: {file.name}</p>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={!file || uploading}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-brand-warning text-white rounded-lg text-sm font-medium hover:bg-brand-warning/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleAssignmentModal({ onClose }: { onClose: () => void }) {
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [fetchingEmployees, setFetchingEmployees] = React.useState(false);

  const boardRoles = [
    { value: 'chairperson', label: 'Chairperson' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'fund_manager', label: 'Fund Manager' },
    { value: 'union_rep', label: 'Union Representative' },
  ];

  // Fetch employees on mount
  React.useEffect(() => {
    const fetchEmployees = async () => {
      setFetchingEmployees(true);
      try {
        const response = await fetch('/api/admin/employees');
        const data = await response.json();
        if (response.ok) {
          setEmployees(data.employees || []);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setFetchingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedRole) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        onClose();
        // Refresh dashboard or show success message
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Assign Board Role</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={fetchingEmployees}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50"
            >
              <option value="">
                {fetchingEmployees ? 'Loading employees...' : 'Choose an employee...'}
              </option>
              {employees.map((emp: any) => (
                <option key={emp.employee_no} value={emp.employee_no}>
                  {emp.first_name} {emp.last_name} ({emp.employee_no}) - {emp.profiles?.role || 'employee'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="">Choose a role...</option>
              {boardRoles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedEmployee || !selectedRole || loading}
            className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard({ stats }: { stats: DashboardStats }) {
  const totalCapital = stats.totalSavings + stats.totalLoansOutstanding || 1;
  const loanPct = Math.round((stats.totalLoansOutstanding / totalCapital) * 100);
  const savingsPct = Math.round((stats.totalSavings / totalCapital) * 100);
  const reservePct = Math.max(0, 100 - loanPct - savingsPct);
  
  const [showRoleAssignment, setShowRoleAssignment] = React.useState(false);
  const [showEmployeeImport, setShowEmployeeImport] = React.useState(false);
  const [showFinancialImport, setShowFinancialImport] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Platform Overview</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Monitor your entire financial ecosystem</p>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 [&>*]:min-w-0">
        <DashboardStatCard
          title="Total Employees"
          value={formatNumber(stats.totalEmployees)}
          icon={Users}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={PiggyBank}
          color="text-brand-success"
        />
        <DashboardStatCard
          title="Total Loan Balance"
          value={formatCurrency(stats.totalLoansOutstanding)}
          icon={BadgeCent}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Fund Balance"
          value={formatCurrency(stats.fundBalance)}
          icon={Wallet}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Pending Approvals"
          value={formatNumber(stats.pendingApprovals)}
          icon={CheckCircle}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Monthly Dividends"
          value={formatCurrency(stats.totalDividends)}
          icon={TrendingUp}
          color="text-brand-success"
        />
      </div>

      {/* Section 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Analytics */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Savings Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Monthly savings trends</p>
            </div>
            <select className="bg-white border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-green">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.savingsTrend}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D7A4D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2D7A4D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `₵${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value) => `₵${(value as number).toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#2D7A4D" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Loan Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Loan Trend</h3>
              <p className="text-brand-text-secondary text-sm">Disbursements vs repayments</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.loanTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `₵${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value) => `₵${(value as number).toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Bar dataKey="disbursements" fill="#b59a6d" name="Disbursements" />
                <Bar dataKey="repayments" fill="#2D7A4D" name="Repayments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Loan Analytics */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Loan Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Distribution by type</p>
            </div>
          </div>
          {stats.loanDistribution.length === 0 ? (
            <p className="flex h-64 items-center justify-center text-sm text-brand-text-secondary">
              No loan data yet.
            </p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.loanDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {stats.loanDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-brand-text-secondary">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Section 3: Fund Utilization */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Fund Utilization</h3>
            <p className="text-brand-text-secondary text-sm">Capital allocation overview</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-accent flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{loanPct}%</span>
            </div>
            <p className="text-brand-text font-medium">Loans</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.totalLoansOutstanding)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-green flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{savingsPct}%</span>
            </div>
            <p className="text-brand-text font-medium">Savings</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.totalSavings)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-warning flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{reservePct}%</span>
            </div>
            <p className="text-brand-text font-medium">Reserves</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.fundBalance)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-card-border flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{formatNumber(stats.activeUsers)}</span>
            </div>
            <p className="text-brand-text font-medium">Operations</p>
            <p className="text-brand-text-secondary text-sm">Active users</p>
          </div>
        </div>
      </GlassCard>

      {/* Section 4: Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Recent Activity</h3>
              <p className="text-brand-text-secondary text-sm">Latest system events</p>
            </div>
            <Activity className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                description={item.description}
                time={item.time}
                icon={Activity}
                color="text-brand-accent"
              />
            )) : (
              <p className="text-brand-text-secondary text-sm">No recent activity</p>
            )}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">System Health</h3>
              <p className="text-brand-text-secondary text-sm">Platform performance metrics</p>
            </div>
            <Shield className="w-5 h-5 text-brand-green" />
          </div>
          <div className="space-y-4">
            <HealthMetric label="Active Users" value={formatNumber(stats.activeUsers)} status="healthy" />
            <HealthMetric label="Pending Approvals" value={formatNumber(stats.pendingApprovals)} status={stats.pendingApprovals > 0 ? "warning" : "healthy"} />
            <HealthMetric label="Audit Events" value={formatNumber(stats.auditLogCount)} status="healthy" />
            <HealthMetric label="Transactions Today" value={formatNumber(stats.transactionsToday)} status="healthy" />
            <HealthMetric label="Total Employees" value={formatNumber(stats.totalEmployees)} status="healthy" />
          </div>
        </GlassCard>
      </div>

      {/* Section 5: Approval Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Approval Queue</h3>
            <p className="text-brand-text-secondary text-sm">Items awaiting your attention</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-sm font-medium">
              {stats.pendingApprovals} pending
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Type</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Requester</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Time</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.approvalQueue.length > 0 ? stats.approvalQueue.map((item) => (
                <ApprovalRow
                  key={item.id}
                  type={item.type}
                  requester={item.requester}
                  amount={item.amount}
                  status={item.status}
                  time={item.time}
                />
              )) : (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-brand-text-secondary text-sm">
                    No pending approvals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Section 6: User Management (Super Admin Only) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">User Management</h3>
            <p className="text-brand-text-secondary text-sm">Manage system users and roles</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFinancialImport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent/90 transition-all"
            >
              <Database className="w-4 h-4" />
              Import/Export Data
            </button>
            <button 
              onClick={() => setShowEmployeeImport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-warning text-white rounded-lg text-sm font-medium hover:bg-brand-warning/90 transition-all"
            >
              <Upload className="w-4 h-4" />
              Import Employees
            </button>
            <button 
              onClick={() => setShowRoleAssignment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent/90 transition-all"
            >
              <Shield className="w-4 h-4" />
              Assign Board Role
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-all">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">User</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Role</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Last Active</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-card-border">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white text-sm font-medium">SA</div>
                    <div>
                      <p className="text-brand-text text-sm font-medium">Super Admin</p>
                      <p className="text-brand-text-secondary text-xs">admin@gtpea.com</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-medium">super_admin</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-brand-green/20 text-brand-green rounded-full text-xs font-medium">Active</span>
                </td>
                <td className="py-3 px-4 text-brand-text-secondary text-sm">Just now</td>
                <td className="py-3 px-4">
                  <UserActionsDropdown userId="user-1" currentRole="super_admin" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Role Assignment Modal */}
      {showRoleAssignment && (
        <RoleAssignmentModal onClose={() => setShowRoleAssignment(false)} />
      )}

      {/* Employee Import Modal */}
      {showEmployeeImport && (
        <EmployeeImportModal onClose={() => setShowEmployeeImport(false)} />
      )}

      {/* Financial Data Import/Export Modal */}
      {showFinancialImport && (
        <FinancialDataModal onClose={() => setShowFinancialImport(false)} />
      )}

      {/* Pending Employees Review Section */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Pending Employee Approvals</h3>
            <p className="text-brand-text-secondary text-sm">Review imported employee data</p>
          </div>
          <FileText className="w-5 h-5 text-brand-warning" />
        </div>
        <PendingEmployeesTable />
      </GlassCard>

      {/* Section 7: System Configuration (Super Admin Only) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">System Configuration</h3>
            <p className="text-brand-text-secondary text-sm">Platform settings and controls</p>
          </div>
          <Settings className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ConfigItem
            icon={Shield}
            title="Security Settings"
            description="Password policies, 2FA, session limits"
            status="Configured"
          />
          <ConfigItem
            icon={Database}
            title="Database Settings"
            description="Backup schedules, retention policies"
            status="Active"
          />
          <ConfigItem
            icon={Key}
            title="API Keys"
            description="External service integrations"
            status="Secure"
          />
          <ConfigItem
            icon={Lock}
            title="Access Control"
            description="Role permissions, IP restrictions"
            status="Enforced"
          />
          <ConfigItem
            icon={AlertTriangle}
            title="Alert Thresholds"
            description="System monitoring and notifications"
            status="Configured"
          />
          <ConfigItem
            icon={Activity}
            title="Audit Logging"
            description="Activity tracking and compliance"
            status="Enabled"
          />
        </div>
      </GlassCard>

      {/* Section 8: Emergency Controls (Super Admin Only) */}
      <GlassCard className="p-6 border-2 border-brand-danger/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-danger">Emergency Controls</h3>
            <p className="text-brand-text-secondary text-sm">Critical system actions - use with caution</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-brand-danger" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EmergencyButton
            icon={Lock}
            title="Lock System"
            description="Prevent all logins"
            variant="danger"
          />
          <EmergencyButton
            icon={Database}
            title="Emergency Backup"
            description="Force database backup"
            variant="warning"
          />
          <EmergencyButton
            icon={Shield}
            title="Enable Maintenance"
            description="Put system in maintenance mode"
            variant="warning"
          />
          <EmergencyButton
            icon={Trash2}
            title="Clear Sessions"
            description="Force logout all users"
            variant="danger"
          />
        </div>
      </GlassCard>
    </div>
  );
}

function ActivityItem({ title, description, time, icon: Icon, color }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-hover transition-all cursor-pointer">
      <div className={`p-2 rounded-lg bg-brand-hover ${color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-brand-text text-sm font-medium">{title}</p>
        <p className="text-brand-text-secondary text-xs">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-brand-text-secondary text-xs flex-shrink-0">
        <Clock className="w-3 h-3" />
        {time}
      </div>
    </div>
  );
}

function HealthMetric({ label, value, status }: any) {
  const statusColors = {
    healthy: 'bg-brand-green',
    warning: 'bg-brand-warning',
    error: 'bg-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-hover">
      <span className="text-brand-text-secondary text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-brand-text font-medium">{value}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
    </div>
  );
}

function ApprovalRow({ type, requester, amount, status, time }: any) {
  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-3 px-4 text-brand-text text-sm">{type}</td>
      <td className="py-3 px-4 text-brand-text text-sm">{requester}</td>
      <td className="py-3 px-4 text-brand-text text-sm font-medium">{amount}</td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-xs font-medium">
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-brand-text-secondary text-sm">{time}</td>
      <td className="py-3 px-4">
        <button className="px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-lg text-xs font-medium hover:bg-brand-green/20 transition-all">
          Review
        </button>
      </td>
    </tr>
  );
}
