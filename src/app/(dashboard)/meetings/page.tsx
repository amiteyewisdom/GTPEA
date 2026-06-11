import GlassCard from "@/components/ui/GlassCard";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meetings" };

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Meetings</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Scheduled board and committee meetings
        </p>
      </div>

      <GlassCard className="p-10 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-brand-text-secondary/50" />
        <p className="font-medium text-brand-text">No meetings scheduled</p>
        <p className="mt-2 text-sm text-brand-text-secondary">
          Meetings will appear here once they are added to the system.
        </p>
      </GlassCard>
    </div>
  );
}
