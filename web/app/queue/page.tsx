import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReviewQueue } from "@/components/review-queue";

export default function QueuePage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 h-full">
        {/* List Column (4 cols) */}
        <div className="md:col-span-4 lg:col-span-3 border-r h-full">
            <ReviewQueue />
        </div>
        
        {/* Detail Panel (8 cols) */}
        <div className="md:col-span-8 lg:col-span-9 h-full bg-muted/10 p-6 flex items-center justify-center text-muted-foreground">
            Select an item to review
        </div>
      </div>
    </DashboardLayout>
  );
}
