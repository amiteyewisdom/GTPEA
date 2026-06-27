import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  BadgeCent, 
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
  ChevronRight,
  Receipt
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
  // Administrator
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/overview',
    roles: ['super_admin'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    roles: ['super_admin'],
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: Shield,
    path: '/roles',
    roles: ['super_admin'],
  },
  {
    id: 'loans-sa',
    label: 'Loans',
    icon: BadgeCent,
    path: '/loans',
    roles: ['super_admin'],
  },
  {
    id: 'savings-sa',
    label: 'Savings',
    icon: PiggyBank,
    path: '/savings',
    roles: ['super_admin'],
  },
  {
    id: 'funds',
    label: 'Funds',
    icon: Wallet,
    path: '/funds',
    roles: ['super_admin'],
  },
  {
    id: 'reports-sa',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    roles: ['super_admin'],
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: Activity,
    path: '/audit',
    roles: ['super_admin'],
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    path: '/system-settings',
    roles: ['super_admin'],
  },

  // Administrator
  {
    id: 'dashboard-admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    roles: ['administrator'],
  },
  {
    id: 'employees-admin',
    label: 'Employees',
    icon: Users,
    path: '/employees',
    roles: ['administrator'],
  },
  {
    id: 'loans-admin',
    label: 'Loans',
    icon: BadgeCent,
    path: '/loans',
    roles: ['administrator'],
  },
  {
    id: 'savings-admin',
    label: 'Savings',
    icon: PiggyBank,
    path: '/savings',
    roles: ['administrator'],
  },
  {
    id: 'approvals-admin',
    label: 'Approvals',
    icon: CheckCircle,
    path: '/approvals',
    roles: ['administrator'],
  },
  {
    id: 'reports-admin',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    roles: ['administrator'],
  },
  {
    id: 'data-imports',
    label: 'Data Imports',
    icon: Upload,
    path: '/data-imports',
    roles: ['administrator'],
  },
  {
    id: 'settings-admin',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['administrator'],
  },

  // Chairperson
  {
    id: 'executive-dashboard',
    label: 'Executive Dashboard',
    icon: LayoutDashboard,
    path: '/executive',
    roles: ['chairperson'],
  },
  {
    id: 'final-approvals',
    label: 'Final Approvals',
    icon: CheckCircle,
    path: '/final-approvals',
    roles: ['chairperson'],
  },
  {
    id: 'financial-overview',
    label: 'Financial Overview',
    icon: TrendingUp,
    path: '/financial-overview',
    roles: ['chairperson'],
  },
  // TODO: Future upgrade — Meetings module
  // {
  //   id: 'meetings',
  //   label: 'Meetings',
  //   icon: Calendar,
  //   path: '/meetings',
  //   roles: ['chairperson'],
  // },
  {
    id: 'members',
    label: 'Members',
    icon: Users,
    path: '/members',
    roles: ['chairperson'],
  },

  // Fund Manager
  {
    id: 'dashboard-fm',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/fund-manager',
    roles: ['fund_manager'],
  },
  {
    id: 'loan-reviews',
    label: 'Loan Reviews',
    icon: ClipboardList,
    path: '/loan-reviews',
    roles: ['fund_manager'],
  },
  {
    id: 'disbursements',
    label: 'Disbursements',
    icon: CreditCard,
    path: '/disbursements',
    roles: ['fund_manager'],
  },
  {
    id: 'repayments',
    label: 'Repayments',
    icon: BadgeCent,
    path: '/repayments',
    roles: ['fund_manager'],
  },
  {
    id: 'fund-ledger',
    label: 'Fund Ledger',
    icon: BarChart3,
    path: '/fund-ledger',
    roles: ['fund_manager'],
  },
  {
    id: 'reports-fm',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    roles: ['fund_manager'],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Receipt,
    path: '/expenses',
    roles: ['fund_manager'],
  },
  {
    id: 'charges',
    label: 'Member Charges',
    icon: BadgeCent,
    path: '/charges',
    roles: ['fund_manager'],
  },

  // Union Representative
  {
    id: 'dashboard-ur',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/union-rep',
    roles: ['union_rep'],
  },
  {
    id: 'loan-reviews-ur',
    label: 'Loan Reviews',
    icon: ClipboardList,
    path: '/loan-reviews',
    roles: ['union_rep'],
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    icon: Star,
    path: '/recommendations',
    roles: ['union_rep'],
  },
  {
    id: 'reports-ur',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
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
    icon: BadgeCent,
    path: '/apply-loan',
    roles: ['employee'],
  },
  {
    id: 'my-loans',
    label: 'My Loans',
    icon: Briefcase,
    path: '/my-loans',
    roles: ['employee'],
  },
  {
    id: 'savings-history',
    label: 'Savings History',
    icon: PiggyBank,
    path: '/savings-history',
    roles: ['employee'],
  },
  {
    id: 'withdrawal-history',
    label: 'Withdrawal History',
    icon: History,
    path: '/withdrawal-history',
    roles: ['employee'],
  },
  {
    id: 'profile-employee',
    label: 'Profile',
    icon: User,
    path: '/profile',
    roles: ['employee'],
  },
];

export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return menuItems.filter(item => item.roles.includes(role));
}
