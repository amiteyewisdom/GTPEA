import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoanReviewsPage() {
  // Loan reviews are now integrated into the main approvals page
  // This page redirects to the approvals page for a better user experience
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-text mb-4">Loan Reviews</h1>
        <p className="text-brand-text-secondary mb-6">
          Loan reviews have been integrated into the main approvals page for better workflow management.
        </p>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
        >
          Go to Approvals Page
        </Link>
      </div>
    </div>
  );
}
