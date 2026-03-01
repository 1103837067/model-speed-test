import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TestResult } from "@/lib/types";

interface SpeedChartProps {
  results: TestResult[];
}

export function SpeedChart({ results }: SpeedChartProps) {
  const successResults = results.filter((r) => r.status === "success");
  if (successResults.length === 0) return null;

  const maxCps = Math.max(...successResults.map((r) => r.cps));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">速度对比</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {successResults.map((result) => {
            const widthPercent =
              maxCps > 0 ? (result.cps / maxCps) * 100 : 0;

            return (
              <div key={result.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px]">
                    <span className="text-muted-foreground">
                      {result.providerName} /{" "}
                    </span>
                    {result.modelId}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {result.cps} 字符/秒
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
