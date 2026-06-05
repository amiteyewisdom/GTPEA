import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  DollarSign, 
  PiggyBank, 
  TrendingUp, 
  FileText, 
  Activity,
  Settings,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  BarChart3,
  Building2,
  Upload,
  Download,
  Wallet,
  CreditCard,
  Home,
  Briefcase,
  History,
  UserCheck,
  Award,
  ClipboardList,
  ChevronRight
} from 'lucide-react';

export type UserRole = 
  | 'super_admin'
  | 'administrator'
  | 'chairperson'
  | 'fund_manager'
  | 'union_rep'
  | 'employee';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  roles: UserRole[];
}

export const menuItems: MenuItem[] = [
  // Super Admin
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/dashboard/overview',
    roles: ['super_admin'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/dashboard/users',
    roles: ['super_admin'],
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: Shield,
    path: '/dashboard/roles',
    roles: ['super_admin'],
  },
  {
    id: 'loans-sa',
    label: 'Loans',
    icon: DollarSign,
    path: '/dashboard/loans',
    roles: ['super_admin'],
  },
  {
    id: 'savings-sa',
    label: 'Savings',
    icon: PiggyBank,
    path: '/dashboard/savings',
    roles: ['super_admin'],
  },
  {
    id: 'funds',
    label: 'Funds',
    icon: Wallet,
    path: '/dashboard/funds',
    roles: ['super_admin'],
  },
  {
    id: 'reports-sa',
    label: 'Reports',
    icon: FileText,
    path: '/dashboard/reports',
    roles: ['super_admin'],
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: Activity,
    path: '/dashboard/audit',
    roles: ['super_admin'],
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    path: '/dashboard/system-settings',
    roles: ['super_admin'],
  },

  // Administrator
  {
    id: 'dashboard-admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard/admin',
    roles: ['administrator'],
  },
  {
    id: 'employees-admin',
    label: 'Employees',
    icon: Users,
    path: '/dashboard/employees',
    roles: ['administrator'],
  },
  {
    id: 'loans-admin',
    label: 'Loans',
    icon: DollarSign,
    path: '/dashboard/loans',
    roles: ['administrator'],
  },
  {
    id: 'savings-admin',
    label: 'Savings',
    icon: PiggyBank,
    path: '/dashboard/savings',
    roles: ['administrator'],
  },
  {
    id: 'approvals-admin',
    label: 'Approvals',
    icon: CheckCircle,
    path: '/dashboard/approvals',
    roles: ['administrator'],
  },
  {
    id: 'reports-admin',
    label: 'Reports',
    icon: FileText,
    path: '/dashboard/reports',
    roles: ['administrator'],
  },
  {
    id: 'data-imports',
    label: 'Data Imports',
    icon: Upload,
    path: '/dashboard/data-imports',
    roles: ['administrator'],
  },
  {
    id: 'settings-admin',
    label: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    roles: ['administrator'],
  },

  // Chairperson
  {
    id: 'executive-dashboard',
    label: 'Executive Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard/executive',
    roles: ['chairperson'],
  },
  {
    id: 'final-approvals',
    label: 'Final Approvals',
    icon: CheckCircle,
    path: '/dashboard/final-approvals',
    roles: ['chairperson'],
  },
  {
    id: 'financial-overview',
    label: 'Financial Overview',
    icon: TrendingUp,
    path: '/dashboard/financial-overview',
    roles: ['chairperson'],
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    path: '/dashboard/meetings',
    roles: ['chairperson'],
  },
  {
    id: 'members',
    label: 'Members',
    icon: Users,
    path: '/dashboard/members',
    roles: ['chairperson'],
  },

  // Fund Manager
  {
    id: 'dashboard-fm',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard/fund-manager',
    roles: ['fund_manager'],
  },
  {
    id: 'loan-reviews',
    label: 'Loan Reviews',
    icon: ClipboardList,
    path: '/dashboard/loan-reviews',
    roles: ['fund_manager'],
  },
  {
    id: 'disbursements',
    label: 'Disbursements',
    icon: CreditCard,
    path: '/dashboard/disbursements',
    roles: ['fund_manager'],
  },
  {
    id: 'repayments',
    label: 'Repayments',
    icon: DollarSign,
    path: '/dashboard/repayments',
    roles: ['fund_manager'],
  },
  {
    id: 'fund-ledger',
    label: 'Fund Ledger',
    icon: BarChart3,
    path: '/dashboard/fund-ledger',
    roles: ['fund_manager'],
  },
  {
    id: 'reports-fm',
    label: 'Reports',
    icon: FileText,
    path: '/dashboard/reports',
    roles: ['fund_manager'],
  },

  // Union Representative
  {
    id: 'dashboard-ur',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard/union-rep',
    roles: ['union_rep'],
  },
  {
    id: 'loan-reviews-ur',
    label: 'Loan Reviews',
    icon: ClipboardList,
    path: '/dashboard/loan-reviews',
    roles: ['union_rep'],
  },
  {
    id: 'employees-ur',
    label: 'Employees',
    icon: Users,
    path: '/dashboard/employees',
    roles: ['union_rep'],
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    icon: Star,
    path: '/dashboard/recommendations',
    roles: ['union_rep'],
  },
  {
    id: 'reports-ur',
    label: 'Reports',
    icon: FileText,
    path: '/dashboard/reports',
    roles: ['union_rep'],
  },

  // Employee
  {
    id: 'dashboard-employee',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['employee'],
  },
  {
    id: 'apply-loan',
    label: 'Apply Loan',
    icon: DollarSign,
    path: '/dashboard/apply-loan',
    roles: ['employee'],
  },
  {
    id: 'my-loans',
    label: 'My Loans',
    icon: Briefcase,
    path: '/dashboard/my-loans',
    roles: ['employee'],
  },
  {
    id: 'savings-history',
    label: 'Savings History',
    icon: PiggyBank,
    path: '/dashboard/savings-history',
    roles: ['employee'],
  },
  {
    id: 'withdrawal-history',
    label: 'Withdrawal History',
    icon: History,
    path: '/dashboard/withdrawal-history',
    roles: ['employee'],
  },
  {
    id: 'profile-employee',
    label: 'Profile',
    icon: User,
    path: '/dashboard/profile',
    roles: ['employee'],
  },
];

export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return menuItems.filter(item => item.roles.includes(role));
}
