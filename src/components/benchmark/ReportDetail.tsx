import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BenchmarkTable } from "./BenchmarkTable";
import { SpeedChart } from "./SpeedChart";
import type { TestReport } from "@/lib/types";
import { Clock, MessageSquare, Zap, ListOrdered, Globe, Wifi } from "lucide-react";

interface ReportDetailProps {
  report: TestReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  const avgCps =
    report.results.filter((r) => r.status === "success").length > 0
      ? Math.round(
          report.results
            .filter((r) => r.status === "success")
            .reduce((sum, r) => sum + r.cps, 0) /
            report.results.filter((r) => r.status === "success").length,
        )
      : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            测试概况
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">时间:</span>
              <span className="font-mono text-xs">
                {new Date(report.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {report.mode === "concurrent" ? (
                <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ListOrdered className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-muted-foreground">模式:</span>
              <Badge variant="secondary" className="text-xs">
                {report.mode === "concurrent" ? "并发" : "逐个"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">模型数:</span>
              <span className="font-medium">
                {report.successCount + report.errorCount}
              </span>
              <span className="text-xs text-muted-foreground">
                ({report.successCount} 成功 / {report.errorCount} 失败)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">平均速度:</span>
              <span className="font-mono font-medium">{avgCps} 字符/秒</span>
            </div>
          </div>

          {report.env && (
            <div className="rounded-md bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5">网络环境</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {report.env.ip && (
                      <span>
                        <span className="text-muted-foreground">IP: </span>
                        <span className="font-mono">{report.env.ip}</span>
                      </span>
                    )}
                    {report.env.location && (
                      <span>
                        <span className="text-muted-foreground">地区: </span>
                        <span>{report.env.location}</span>
                      </span>
                    )}
                    {report.env.isp && (
                      <span>
                        <span className="text-muted-foreground">运营商: </span>
                        <span>{report.env.isp}</span>
                      </span>
                    )}
                    {report.env.effectiveType !== "unknown" && (
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">{report.env.effectiveType}</span>
                      </span>
                    )}
                    {report.env.downlinkMbps > 0 && (
                      <span>
                        <span className="text-muted-foreground">带宽: </span>
                        <span className="font-mono">{report.env.downlinkMbps} Mbps</span>
                      </span>
                    )}
                    {report.env.rttMs > 0 && (
                      <span>
                        <span className="text-muted-foreground">RTT: </span>
                        <span className="font-mono">{report.env.rttMs} ms</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">测试 Prompt</p>
                <p className="text-sm whitespace-pre-wrap">{report.prompt}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SpeedChart results={report.results} />
      <BenchmarkTable results={report.results} />
    </div>
  );
}
