import { createClient } from "@/lib/supabase/server";
import { ApprovalsClient } from "@/features/approvals/ApprovalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const supabase = await createClient();

  // Get current user's role
  const { data: { user } } = await supabase.auth.getUser();
  const userRole = user?.id 
    ? ((await supabase.from("profiles").select("role").eq("user_id", user.id).single()) as any).data?.role || "employee"
    : "employee";

  const { data: approvals, count } = await supabase
    .from("approvals")
    .select(
      `*, 
       profiles!approvals_submitted_by_fkey (full_name), 
       approval_actions (stage, required_role, action, notes, actioned_at),
       loans!approvals_entity_id_fkey (
         amount_requested, 
         amount_approved, 
         outstanding_balance, 
         monthly_repayment, 
         term_months, 
         interest_rate
       ),
       withdrawal_requests!approvals_entity_id_fkey (
         amount,
         savings (balance, type)
       )`,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false });

  // Fetch employee financial summary for each approval
  const approvalsWithDetails = await Promise.all(
    (approvals ?? []).map(async (approval: any) => {
      let employeeDetails = null;
      
      if (approval.entity_type === 'loan' && approval.loans) {
        // Fetch employee's total savings, loan balance, and monthly savings
        const { data: employeeData } = await supabase
          .from('employees')
          .select(`
            id,
            savings (balance),
            loans (outstanding_balance)
          `)
          .eq('id', approval.loans.employee_id)
          .single();

        if (employeeData) {
          const totalSavings = (employeeData.savings as any[])?.reduce((sum: number, s: any) => sum + (s.balance || 0), 0) || 0;
          const totalLoanBalance = (employeeData.loans as any[])?.reduce((sum: number, l: any) => sum + (l.outstanding_balance || 0), 0) || 0;
          
          // Calculate monthly savings from recent contributions
          const { data: contributions } = await supabase
            .from('savings_contributions')
            .select('amount')
            .eq('employee_id', employeeData.id)
            .gte('contribution_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          
          const monthlySavings = contributions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

          employeeDetails = {
            total_savings: totalSavings,
            total_loan_balance: totalLoanBalance,
            monthly_savings: monthlySavings,
          };
        }
      } else if (approval.entity_type === 'withdrawal' && approval.withdrawal_requests) {
        // Fetch employee's total savings and loan balance
        const { data: employeeData } = await supabase
          .from('employees')
          .select(`
            id,
            savings (balance),
            loans (outstanding_balance)
          `)
          .eq('id', approval.withdrawal_requests.employee_id)
          .single();

        if (employeeData) {
          const totalSavings = (employeeData.savings as any[])?.reduce((sum: number, s: any) => sum + (s.balance || 0), 0) || 0;
          const totalLoanBalance = (employeeData.loans as any[])?.reduce((sum: number, l: any) => sum + (l.outstanding_balance || 0), 0) || 0;
          
          // Calculate monthly savings from recent contributions
          const { data: contributions } = await supabase
            .from('savings_contributions')
            .select('amount')
            .eq('employee_id', employeeData.id)
            .gte('contribution_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          
          const monthlySavings = contributions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

          employeeDetails = {
            total_savings: totalSavings,
            total_loan_balance: totalLoanBalance,
            monthly_savings: monthlySavings,
          };
        }
      }

      return {
        ...approval,
        loan_details: approval.entity_type === 'loan' && approval.loans ? {
          amount_requested: approval.loans.amount_requested,
          amount_approved: approval.loans.amount_approved,
          outstanding_balance: approval.loans.outstanding_balance,
          monthly_repayment: approval.loans.monthly_repayment,
          term_months: approval.loans.term_months,
          interest_rate: approval.loans.interest_rate,
        } : null,
        withdrawal_details: approval.entity_type === 'withdrawal' && approval.withdrawal_requests ? {
          amount: approval.withdrawal_requests.amount,
          savings_balance: approval.withdrawal_requests.savings?.[0]?.balance || 0,
          savings_type: approval.withdrawal_requests.savings?.[0]?.type || 'N/A',
        } : null,
        employee_details: employeeDetails,
      };
    })
  );

  return <ApprovalsClient approvals={approvalsWithDetails} total={count ?? 0} userRole={userRole} />;
}
