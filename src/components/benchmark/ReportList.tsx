import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TestReport } from "@/lib/types";
import { Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportListProps {
  reports: TestReport[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ReportList({
  reports,
  selectedId,
  onSelect,
  onDelete,
}: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
        <FileText className="mb-2 h-8 w-8 opacity-40" />
        暂无测试报告
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {reports.map((report) => {
        const isActive = report.id === selectedId;
        return (
          <div
            key={report.id}
            className={cn(
              "group flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors",
              isActive
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted/50",
            )}
            onClick={() => onSelect(report.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {formatTime(report.createdAt)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {report.prompt.slice(0, 50)}
                {report.prompt.length > 50 ? "..." : ""}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {report.mode === "concurrent" ? "并发" : "逐个"}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {report.successCount + report.errorCount} 模型
                </Badge>
                {report.successCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 text-green-600"
                  >
                    {report.successCount} 成功
                  </Badge>
                )}
                {report.errorCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1 py-0">
                    {report.errorCount} 失败
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(report.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
