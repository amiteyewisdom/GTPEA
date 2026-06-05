'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  DollarSign,
  PiggyBank,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function UnionRepDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-text mb-2">Union Representative Dashboard</h1>
        <p className="text-brand-text-secondary">Review and recommend loan applications</p>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending Reviews"
          value="18"
          change="+5"
          trend="up"
          icon={ClipboardList}
          color="text-brand-warning"
        />
        <StatCard
          title="Approved Reviews"
          value="45"
          change="+12"
          trend="up"
          icon={CheckCircle}
          color="text-brand-success"
        />
        <StatCard
          title="Rejected Reviews"
          value="7"
          change="-2"
          trend="down"
          icon={XCircle}
          color="text-brand-danger"
        />
      </div>

      {/* Employee Eligibility Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Employee Eligibility Queue</h3>
            <p className="text-brand-text-secondary text-sm">Review loan eligibility for each employee</p>
          </div>
          <UserCheck className="w-5 h-5 text-brand-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Card 1 */}
          <EmployeeEligibilityCard
            name="John Smith"
            employeeId="EMP-001"
            currentSavings="$45,000"
            currentLoans="$15,000"
            monthlyRepayments="$1,250"
            loanHistory="3 loans, all repaid on time"
            eligibilityScore={92}
            status="eligible"
          />
          
          {/* Employee Card 2 */}
          <EmployeeEligibilityCard
            name="Sarah Johnson"
            employeeId="EMP-002"
            currentSavings="$32,000"
            currentLoans="$8,000"
            monthlyRepayments="$890"
            loanHistory="2 loans, 1 late payment"
            eligibilityScore={78}
            status="review"
          />
          
          {/* Employee Card 3 */}
          <EmployeeEligibilityCard
            name="Mike Davis"
            employeeId="EMP-003"
            currentSavings="$28,000"
            currentLoans="$12,000"
            monthlyRepayments="$1,450"
            loanHistory="4 loans, 2 late payments"
            eligibilityScore={65}
            status="caution"
          />
          
          {/* Employee Card 4 */}
          <EmployeeEligibilityCard
            name="Emily Brown"
            employeeId="EMP-004"
            currentSavings="$55,000"
            currentLoans="$20,000"
            monthlyRepayments="$2,100"
            loanHistory="5 loans, all repaid on time"
            eligibilityScore={95}
            status="eligible"
          />
          
          {/* Employee Card 5 */}
          <EmployeeEligibilityCard
            name="David Wilson"
            employeeId="EMP-005"
            currentSavings="$38,000"
            currentLoans="$10,000"
            monthlyRepayments="$780"
            loanHistory="2 loans, all repaid on time"
            eligibilityScore={88}
            status="eligible"
          />
          
          {/* Employee Card 6 */}
          <EmployeeEligibilityCard
            name="Lisa Anderson"
            employeeId="EMP-006"
            currentSavings="$22,000"
            currentLoans="$18,000"
            monthlyRepayments="$1,670"
            loanHistory="3 loans, multiple late payments"
            eligibilityScore={52}
            status="ineligible"
          />
        </div>
      </GlassCard>

      {/* Recent Recommendations */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Recent Recommendations</h3>
            <p className="text-brand-text-secondary text-sm">Your latest recommendations</p>
          </div>
          <Star className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="space-y-3">
          <RecommendationRow
            employee="John Smith"
            action="Recommended for approval"
            amount="$15,000"
            date="2 hours ago"
            status="approved"
          />
          <RecommendationRow
            employee="Sarah Johnson"
            action="Recommended with conditions"
            amount="$8,500"
            date="4 hours ago"
            status="pending"
          />
          <RecommendationRow
            employee="Mike Davis"
            action="Recommended for rejection"
            amount="$25,000"
            date="6 hours ago"
            status="rejected"
          />
          <RecommendationRow
            employee="Emily Brown"
            action="Recommended for approval"
            amount="$12,000"
            date="1 day ago"
            status="approved"
          />
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-5 hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-brand-card-bg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-brand-success' : 'text-brand-danger'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <p className="text-brand-text-secondary text-sm mb-1">{title}</p>
      <p className="text-brand-text text-2xl font-bold">{value}</p>
    </GlassCard>
  );
}

function EmployeeEligibilityCard({ 
  name, 
  employeeId, 
  currentSavings, 
  currentLoans, 
  monthlyRepayments, 
  loanHistory, 
  eligibilityScore, 
  status 
}: any) {
  const statusConfig = {
    eligible: {
      color: 'text-brand-success',
      bgColor: 'bg-brand-success/20',
      borderColor: 'border-brand-success/30',
      label: 'Eligible'
    },
    review: {
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning/20',
      borderColor: 'border-brand-warning/30',
      label: 'Review Required'
    },
    caution: {
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning/20',
      borderColor: 'border-brand-warning/30',
      label: 'Caution'
    },
    ineligible: {
      color: 'text-brand-danger',
      bgColor: 'bg-brand-danger/20',
      borderColor: 'border-brand-danger/30',
      label: 'Not Eligible'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className={`p-5 rounded-lg bg-brand-card-bg border ${config.borderColor} hover:bg-brand-hover transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="text-brand-text font-semibold">{name}</h4>
            <p className="text-brand-text-secondary text-xs">{employeeId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricItem icon={PiggyBank} label="Savings" value={currentSavings} />
        <MetricItem icon={DollarSign} label="Loans" value={currentLoans} />
        <MetricItem icon={TrendingUp} label="Monthly Repayment" value={monthlyRepayments} />
        <MetricItem icon={Star} label="Eligibility Score" value={`${eligibilityScore}%`} highlight={eligibilityScore >= 80} />
      </div>

      {/* Loan History */}
      <div className="mb-4 p-3 rounded-lg bg-brand-card-bg border border-brand-card-border">
        <p className="text-brand-text-secondary text-xs mb-1">Loan History</p>
        <p className="text-brand-text text-sm">{loanHistory}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-success/20 text-brand-success rounded-lg text-sm font-medium hover:bg-brand-success/30 transition-all">
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-warning/20 text-brand-warning rounded-lg text-sm font-medium hover:bg-brand-warning/30 transition-all">
          <Star className="w-4 h-4" />
          Recommend
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-danger/20 text-brand-danger rounded-lg text-sm font-medium hover:bg-brand-danger/30 transition-all">
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

function MetricItem({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${highlight ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
      <div>
        <p className="text-brand-text-secondary text-xs">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-brand-accent' : 'text-brand-text'}`}>{value}</p>
      </div>
    </div>
  );
}

function RecommendationRow({ employee, action, amount, date, status }: any) {
  const statusColors = {
    approved: 'text-brand-success',
    pending: 'text-brand-warning',
    rejected: 'text-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg hover:bg-brand-hover transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
          {employee.charAt(0)}
        </div>
        <div>
          <p className="text-brand-text font-medium">{employee}</p>
          <p className="text-brand-text-secondary text-xs">{action} • {amount}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
        <p className="text-brand-text-secondary text-xs">{date}</p>
      </div>
    </div>
  );
}
