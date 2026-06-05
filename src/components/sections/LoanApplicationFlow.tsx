'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  DollarSign, 
  Calendar, 
  Calculator, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface LoanApplicationFlowProps {
  onSubmit?: (applicationData: LoanApplicationData) => void;
}

interface LoanApplicationData {
  principal: number;
  duration: number;
  interestRate: number;
  interestAmount: number;
  totalPayable: number;
  monthlyRepayment: number;
  firstRepaymentDate: string;
  completionDate: string;
}

const INTEREST_RATE = 12; // 12% annual interest rate

export default function LoanApplicationFlow({ onSubmit }: LoanApplicationFlowProps) {
  const [step, setStep] = useState(1);
  const [principal, setPrincipal] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate loan details
  const interestAmount = (principal * INTEREST_RATE / 100) * (duration / 12);
  const totalPayable = principal + interestAmount;
  const monthlyRepayment = totalPayable / duration;
  
  const today = new Date();
  const firstRepaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const completionDate = new Date(today.getFullYear(), today.getMonth() + duration, 1);

  const loanData: LoanApplicationData = {
    principal,
    duration,
    interestRate: INTEREST_RATE,
    interestAmount,
    totalPayable,
    monthlyRepayment,
    firstRepaymentDate: firstRepaymentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    completionDate: completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit?.(loanData);
      setStep(5); // Success step
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) return principal > 0 && principal <= 100000;
    if (step === 2) return duration >= 6 && duration <= 36;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${step === stepNumber ? 'bg-brand-accent text-brand-primary' : ''}
                  ${step > stepNumber ? 'bg-brand-success text-brand-primary' : ''}
                  ${step < stepNumber ? 'bg-brand-card-bg border border-brand-card-border text-brand-text-secondary' : ''}
                `}
              >
                {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
              </div>
              <p className={`text-xs mt-2 ${step === stepNumber ? 'text-brand-accent font-medium' : 'text-brand-text-secondary'}`}>
                {stepNumber === 1 ? 'Amount' : stepNumber === 2 ? 'Duration' : stepNumber === 3 ? 'Preview' : 'Confirm'}
              </p>
            </div>
            {stepNumber < 4 && (
              <div className="flex-1 h-0.5 bg-brand-card-border mx-4">
                <div 
                  className="h-full bg-brand-accent transition-all duration-500"
                  style={{ width: step > stepNumber ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Step1 principal={principal} setPrincipal={setPrincipal} onNext={() => setStep(2)} canProceed={canProceed()} />
      )}

      {step === 2 && (
        <Step2 duration={duration} setDuration={setDuration} onNext={() => setStep(3)} onBack={() => setStep(1)} canProceed={canProceed()} />
      )}

      {step === 3 && (
        <Step3 loanData={loanData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}

      {step === 4 && (
        <Step4 loanData={loanData} onBack={() => setStep(3)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}

      {step === 5 && (
        <Step5 onReset={() => { setStep(1); setPrincipal(0); setDuration(12); }} />
      )}
    </div>
  );
}

function Step1({ principal, setPrincipal, onNext, canProceed }: any) {
  return (
    <GlassCard className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Enter Loan Amount</h2>
        <p className="text-brand-text-secondary">How much would you like to borrow?</p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <label className="block text-brand-text-secondary text-sm mb-2">Principal Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-brand-accent font-bold">$</span>
          <input
            type="number"
            value={principal || ''}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-4 bg-brand-card-bg border border-brand-card-border rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
          />
        </div>
        <p className="text-brand-text-secondary text-xs mt-2">Maximum loan amount: $100,000</p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {[5000, 10000, 15000, 20000, 25000, 50000].map((amount) => (
          <button
            key={amount}
            onClick={() => setPrincipal(amount)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              principal === amount
                ? 'bg-brand-accent text-brand-primary'
                : 'bg-brand-card-bg border border-brand-card-border text-white hover:bg-brand-hover'
            }`}
          >
            ${amount.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </GlassCard>
  );
}

function Step2({ duration, setDuration, onNext, onBack, canProceed }: any) {
  return (
    <GlassCard className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Duration</h2>
        <p className="text-brand-text-secondary">How long do you need to repay?</p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <label className="block text-brand-text-secondary text-sm mb-2">Loan Duration (Months)</label>
        <div className="relative">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={6}
            max={36}
            className="w-full px-4 py-4 bg-brand-card-bg border border-brand-card-border rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all text-center"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary text-sm">months</span>
        </div>
        <p className="text-brand-text-secondary text-xs mt-2">Duration range: 6 - 36 months</p>
      </div>

      {/* Duration Options */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[6, 12, 18, 24, 30, 36].map((months) => (
          <button
            key={months}
            onClick={() => setDuration(months)}
            className={`p-4 rounded-lg text-center transition-all ${
              duration === months
                ? 'bg-brand-accent text-brand-primary'
                : 'bg-brand-card-bg border border-brand-card-border text-white hover:bg-brand-hover'
            }`}
          >
            <p className="text-xl font-bold">{months}</p>
            <p className="text-xs">months</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-brand-card-bg border border-brand-card-border text-white font-semibold rounded-lg hover:bg-brand-hover transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </GlassCard>
  );
}

function Step3({ loanData, onNext, onBack }: any) {
  return (
    <GlassCard className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loan Calculation Preview</h2>
        <p className="text-brand-text-secondary">Review your loan details before confirming</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CalculationCard
          label="Principal Amount"
          value={`$${loanData.principal.toLocaleString()}`}
          icon={DollarSign}
          color="text-brand-accent"
        />
        <CalculationCard
          label="Duration"
          value={`${loanData.duration} months`}
          icon={Calendar}
          color="text-brand-success"
        />
        <CalculationCard
          label="Interest Rate"
          value={`${loanData.interestRate}% per annum`}
          icon={TrendingUp}
          color="text-brand-warning"
        />
        <CalculationCard
          label="Interest Amount"
          value={`$${loanData.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Calculator}
          color="text-brand-warning"
        />
        <CalculationCard
          label="Total Payable"
          value={`$${loanData.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="text-brand-accent"
          highlight
        />
        <CalculationCard
          label="Monthly Repayment"
          value={`$${loanData.monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Calendar}
          color="text-brand-success"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <DateCard
          label="First Repayment Date"
          date={loanData.firstRepaymentDate}
        />
        <DateCard
          label="Completion Date"
          date={loanData.completionDate}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-brand-card-bg border border-brand-card-border text-white font-semibold rounded-lg hover:bg-brand-hover transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </GlassCard>
  );
}

function Step4({ loanData, onBack, onSubmit, isSubmitting }: any) {
  return (
    <GlassCard className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-warning/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-brand-warning" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Application</h2>
        <p className="text-brand-text-secondary">Please review and confirm your loan application</p>
      </div>

      <div className="bg-brand-card-bg border border-brand-card-border rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Summary</h3>
        <div className="space-y-3">
          <SummaryRow label="Principal Amount" value={`$${loanData.principal.toLocaleString()}`} />
          <SummaryRow label="Duration" value={`${loanData.duration} months`} />
          <SummaryRow label="Interest Rate" value={`${loanData.interestRate}% per annum`} />
          <SummaryRow label="Interest Amount" value={`$${loanData.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <div className="border-t border-brand-card-border pt-3 mt-3">
            <SummaryRow label="Total Payable" value={`$${loanData.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} highlight />
            <SummaryRow label="Monthly Repayment" value={`$${loanData.monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} highlight />
          </div>
        </div>
      </div>

      <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-4 mb-8">
        <p className="text-brand-warning text-sm">
          <strong>Important:</strong> By submitting this application, you agree to the terms and conditions of the loan agreement. Your application will be reviewed by the Union Representative, Fund Manager, and Chairperson before approval.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-brand-card-bg border border-brand-card-border text-white font-semibold rounded-lg hover:bg-brand-hover transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </GlassCard>
  );
}

function Step5({ onReset }: any) {
  return (
    <GlassCard className="p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-success/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-brand-success" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Application Submitted!</h2>
      <p className="text-brand-text-secondary mb-2">Your loan application has been successfully submitted.</p>
      <p className="text-brand-text-secondary mb-8">You can track the status of your application in the dashboard.</p>
      
      <div className="bg-brand-card-bg border border-brand-card-border rounded-lg p-6 mb-8 max-w-md mx-auto">
        <p className="text-brand-text-secondary text-sm mb-2">Application Reference</p>
        <p className="text-white text-xl font-bold">LA-2026-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
      >
        Submit Another Application
      </button>
    </GlassCard>
  );
}

function CalculationCard({ label, value, icon: Icon, color, highlight }: any) {
  return (
    <div className={`p-4 rounded-lg bg-brand-card-bg border ${highlight ? 'border-brand-accent/50' : 'border-brand-card-border'}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <p className="text-brand-text-secondary text-sm">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-brand-accent' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function DateCard({ label, date }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <p className="text-brand-text-secondary text-sm mb-1">{label}</p>
      <p className="text-white font-semibold">{date}</p>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: any) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-brand-text-secondary text-sm">{label}</p>
      <p className={`font-medium ${highlight ? 'text-brand-accent text-lg' : 'text-white'}`}>{value}</p>
    </div>
  );
}
