'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Shield, 
  Briefcase, 
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export type ApprovalStage = 'submitted' | 'union_review' | 'fund_manager' | 'chairperson' | 'approved' | 'rejected';

export interface ApprovalTimelineProps {
  currentStage: ApprovalStage;
  stages?: ApprovalStage[];
  applicationId?: string;
  showDetails?: boolean;
}

const DEFAULT_STAGES: ApprovalStage[] = ['submitted', 'union_review', 'fund_manager', 'chairperson', 'approved'];

const STAGE_CONFIG = {
  submitted: {
    label: 'Submitted',
    description: 'Application submitted by employee',
    icon: User,
    color: 'text-brand-text-secondary',
    bgColor: 'bg-brand-card-bg',
    borderColor: 'border-brand-card-border',
  },
  union_review: {
    label: 'Trustee',
    description: 'Initial review and recommendation',
    icon: User,
    color: 'text-brand-text-secondary',
    bgColor: 'bg-brand-card-bg',
    borderColor: 'border-brand-card-border',
  },
  fund_manager: {
    label: 'Fund Manager',
    description: 'Financial review and approval',
    icon: Briefcase,
    color: 'text-brand-text-secondary',
    bgColor: 'bg-brand-card-bg',
    borderColor: 'border-brand-card-border',
  },
  chairperson: {
    label: 'Chairperson',
    description: 'Final executive approval',
    icon: Award,
    color: 'text-brand-text-secondary',
    bgColor: 'bg-brand-card-bg',
    borderColor: 'border-brand-card-border',
  },
  approved: {
    label: 'Approved',
    description: 'Loan approved and disbursed',
    icon: CheckCircle,
    color: 'text-brand-success',
    bgColor: 'bg-brand-success/20',
    borderColor: 'border-brand-success/30',
  },
  rejected: {
    label: 'Rejected',
    description: 'Application rejected',
    icon: AlertCircle,
    color: 'text-brand-danger',
    bgColor: 'bg-brand-danger/20',
    borderColor: 'border-brand-danger/30',
  },
};

export default function ApprovalTimeline({ 
  currentStage, 
  stages = DEFAULT_STAGES,
  applicationId,
  showDetails = true 
}: ApprovalTimelineProps) {
  const currentIndex = stages.indexOf(currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <GlassCard className="p-6">
      {applicationId && (
        <div className="mb-6">
          <p className="text-brand-text-secondary text-sm">Application ID</p>
          <p className="text-white font-semibold">{applicationId}</p>
        </div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-brand-card-border">
          {!isRejected && (
            <div 
              className="h-full bg-brand-accent transition-all duration-500"
              style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            />
          )}
        </div>

        {/* Stages */}
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
            const Icon = config.icon;
            
            const isCompleted = index < currentIndex && !isRejected;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const isRejectedStage = isRejected && index === currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center flex-1">
                {/* Stage Icon */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all z-10
                    ${isCompleted ? 'bg-brand-success border-brand-success text-brand-primary' : ''}
                    ${isCurrent && !isRejected ? 'bg-brand-accent border-brand-accent text-brand-primary' : ''}
                    ${isPending ? 'bg-brand-card-bg border-brand-card-border text-brand-text-secondary' : ''}
                    ${isRejectedStage ? 'bg-brand-danger border-brand-danger text-brand-primary' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Stage Label */}
                <p className={`text-xs mt-3 text-center font-medium ${isCurrent && !isRejected ? 'text-brand-accent' : 'text-brand-text-secondary'}`}>
                  {config.label}
                </p>

                {/* Stage Description */}
                {showDetails && (
                  <p className="text-xs text-brand-text-secondary text-center mt-1 max-w-[120px]">
                    {config.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {isRejected && (
        <div className="mt-6 p-4 bg-brand-danger/10 border border-brand-danger/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-brand-danger" />
            <div>
              <p className="text-brand-danger font-medium">Application Rejected</p>
              <p className="text-brand-text-secondary text-sm">This application was rejected during the review process.</p>
            </div>
          </div>
        </div>
      )}

      {!isRejected && currentStage === 'approved' && (
        <div className="mt-6 p-4 bg-brand-success/10 border border-brand-success/30 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-brand-success" />
            <div>
              <p className="text-brand-success font-medium">Application Approved</p>
              <p className="text-brand-text-secondary text-sm">Your loan has been approved and will be disbursed shortly.</p>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// Detailed Approval Timeline with timestamps and comments
export interface DetailedApprovalTimelineProps {
  stages: Array<{
    stage: ApprovalStage;
    status: 'completed' | 'pending' | 'in_progress' | 'rejected';
    timestamp?: string;
    reviewer?: string;
    comment?: string;
  }>;
  applicationId?: string;
}

export function DetailedApprovalTimeline({ stages, applicationId }: DetailedApprovalTimelineProps) {
  return (
    <GlassCard className="p-6">
      {applicationId && (
        <div className="mb-6">
          <p className="text-brand-text-secondary text-sm">Application ID</p>
          <p className="text-white font-semibold">{applicationId}</p>
        </div>
      )}

      <div className="space-y-4">
        {stages.map((stageData, index) => {
          const config = STAGE_CONFIG[stageData.stage as keyof typeof STAGE_CONFIG];
          const Icon = config.icon;
          const isLast = index === stages.length - 1;

          return (
            <div key={stageData.stage} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-brand-card-border" />
              )}

              <div className="flex gap-4">
                {/* Stage Icon */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0
                    ${stageData.status === 'completed' ? 'bg-brand-success border-brand-success text-brand-primary' : ''}
                    ${stageData.status === 'in_progress' ? 'bg-brand-accent border-brand-accent text-brand-primary' : ''}
                    ${stageData.status === 'pending' ? 'bg-brand-card-bg border-brand-card-border text-brand-text-secondary' : ''}
                    ${stageData.status === 'rejected' ? 'bg-brand-danger border-brand-danger text-brand-primary' : ''}
                  `}
                >
                  {stageData.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Stage Details */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`font-medium ${stageData.status === 'in_progress' ? 'text-brand-accent' : 'text-white'}`}>
                        {config.label}
                      </p>
                      {stageData.reviewer && (
                        <p className="text-brand-text-secondary text-sm">Reviewed by: {stageData.reviewer}</p>
                      )}
                    </div>
                    {stageData.timestamp && (
                      <p className="text-brand-text-secondary text-xs">{stageData.timestamp}</p>
                    )}
                  </div>

                  {stageData.comment && (
                    <div className="p-3 bg-brand-card-bg border border-brand-card-border rounded-lg">
                      <p className="text-brand-text-secondary text-sm">{stageData.comment}</p>
                    </div>
                  )}

                  {stageData.status === 'in_progress' && (
                    <div className="mt-2 flex items-center gap-2 text-brand-accent text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting review</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// Compact Timeline for use in cards/tables
export interface CompactTimelineProps {
  currentStage: ApprovalStage;
  stages?: ApprovalStage[];
}

export function CompactTimeline({ currentStage, stages = DEFAULT_STAGES }: CompactTimelineProps) {
  const currentIndex = stages.indexOf(currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex && !isRejected;
        const isCurrent = index === currentIndex && !isRejected;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={stage}>
            <div
              className={`
                w-2 h-2 rounded-full
                ${isCompleted ? 'bg-brand-success' : ''}
                ${isCurrent ? 'bg-brand-accent' : ''}
                ${isPending ? 'bg-brand-card-bg' : ''}
              `}
            />
            {index < stages.length - 1 && (
              <div className="flex-1 h-0.5 bg-brand-card-border">
                {!isRejected && (
                  <div 
                    className="h-full bg-brand-accent"
                    style={{ width: index < currentIndex ? '100%' : '0%' }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
