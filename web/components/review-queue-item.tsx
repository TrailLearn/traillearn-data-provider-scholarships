import { Scholarship } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewQueueItemProps {
  scholarship: Scholarship;
  isActive: boolean;
  onClick: () => void;
}

export function ReviewQueueItem({ scholarship, isActive, onClick }: ReviewQueueItemProps) {
  // Simple domain extraction
  const domain = new URL(scholarship.source_url).hostname.replace('www.', '');
  
  // Color coding for Health Score
  const scoreColor = 
    scholarship.health_score >= 80 ? "bg-emerald-500" :
    scholarship.health_score >= 50 ? "bg-amber-500" :
    "bg-rose-500";

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b p-4 transition-colors hover:bg-muted/50",
        isActive && "bg-muted border-l-4 border-l-primary pl-3"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium text-sm line-clamp-1 pr-2">{scholarship.name}</h3>
        <div className={cn("h-2 w-2 rounded-full flex-shrink-0 mt-1", scoreColor)} title={`Score: ${scholarship.health_score}`} />
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span className="truncate max-w-[120px]">{domain}</span>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
          {scholarship.status}
        </Badge>
      </div>
    </div>
  );
}
