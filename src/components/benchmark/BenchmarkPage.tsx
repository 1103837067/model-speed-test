import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportList } from "./ReportList";
import { ReportDetail } from "./ReportDetail";
import { useReports } from "@/hooks/useReports";
import { RefreshCw, Trash2, Loader2, FileText } from "lucide-react";

interface BenchmarkPageProps {
  autoSelectReportId?: string | null;
}

export function BenchmarkPage({ autoSelectReportId }: BenchmarkPageProps) {
  const {
    reports,
    selectedId,
    loading,
    setSelectedId,
    refresh,
    deleteReport,
    clearReports,
  } = useReports();

  const prevAutoId = useRef(autoSelectReportId);
  useEffect(() => {
    if (autoSelectReportId && autoSelectReportId !== prevAutoId.current) {
      prevAutoId.current = autoSelectReportId;
      refresh();
      setSelectedId(autoSelectReportId);
    }
  }, [autoSelectReportId, refresh, setSelectedId]);

  const activeReport =
    reports.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">测试报告</h2>
          <p className="text-sm text-muted-foreground">
            每次测试自动保存，可随时回看历史记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            刷新
          </Button>
          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearReports}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              清空全部
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="lg:h-[calc(100vh-220px)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              报告列表 ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-300px)] p-2">
            <ReportList
              reports={reports}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteReport}
            />
          </CardContent>
        </Card>

        <div>
          {activeReport ? (
            <ReportDetail report={activeReport} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {reports.length > 0
                  ? "选择左侧的报告查看详情"
                  : "暂无测试报告，请先进行速度测试"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
