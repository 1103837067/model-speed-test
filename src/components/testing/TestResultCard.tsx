import { memo, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModelTestState } from "@/lib/types";
import { Loader2, CheckCircle2, XCircle, SkipForward, Clock } from "lucide-react";

interface TestResultCardProps {
  state: ModelTestState;
  onSkip?: () => void;
  canSkip?: boolean;
}

export const TestResultCard = memo(function TestResultCard({
  state,
  onSkip,
  canSkip,
}: TestResultCardProps) {
  const { modelId, providerName, status, result, streamedText, liveChars, liveCps, liveElapsed, liveTtft } = state;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [streamedText]);

  const isQueued = status === "queued";
  const isRunning = status === "running";
  const isDone = status === "done";
  const isSkipped = status === "skipped";
  const isSuccess = isDone && result?.status === "success";
  const isError = isDone && result?.status === "error";

  const cardClass = isQueued
    ? "opacity-60"
    : isRunning
      ? "border-primary/50"
      : isSkipped
        ? "opacity-50"
        : isError
          ? "border-destructive/40 bg-destructive/5"
          : isSuccess
            ? "border-green-500/30"
            : "";

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate">
            <span className="text-muted-foreground">{providerName} / </span>
            {modelId}
          </CardTitle>
          <div className="shrink-0 flex items-center gap-1.5">
            {isQueued && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <Clock className="mr-1 h-3 w-3" />
                排队中
              </Badge>
            )}
            {isRunning && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {canSkip && onSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={onSkip}
                  >
                    <SkipForward className="mr-1 h-3 w-3" />
                    跳过
                  </Button>
                )}
              </>
            )}
            {isSkipped && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                已跳过
              </Badge>
            )}
            {isSuccess && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {isError && (
              <>
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  失败
                </Badge>
                <XCircle className="h-4 w-4 text-destructive" />
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isRunning && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {liveTtft > 0 && (
              <Badge variant="secondary" className="font-mono">
                TTFT: {liveTtft}ms
              </Badge>
            )}
            <Badge variant="outline" className="animate-pulse">
              {liveChars} 字符
            </Badge>
            {liveCps > 0 && (
              <Badge variant="outline" className="animate-pulse font-mono">
                {liveCps} 字符/秒
              </Badge>
            )}
            {liveElapsed > 0 && (
              <Badge variant="outline">
                {(liveElapsed / 1000).toFixed(1)}s
              </Badge>
            )}
          </div>
        )}

        {isSuccess && result && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="secondary">
              TTFT: {result.ttft_ms}ms
            </Badge>
            <Badge variant="secondary">
              总耗时: {result.totalTime_ms}ms
            </Badge>
            <Badge variant="secondary">
              输出: {result.outputChars} 字符
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-mono">
              {result.cps} 字符/秒
            </Badge>
          </div>
        )}

        {isError && result && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2">
            <div className="flex items-start gap-1.5">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-destructive">请求失败</p>
                <p className="mt-0.5 text-xs text-destructive/80 break-all">
                  {result.errorMessage}
                </p>
                {result.totalTime_ms > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    耗时 {result.totalTime_ms}ms
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {streamedText ? (
          <div
            ref={scrollRef}
            className="h-28 overflow-y-auto rounded-md border bg-muted/50 p-2"
          >
            <pre className="whitespace-pre-wrap break-all text-xs text-muted-foreground">
              {streamedText}
              {isRunning && (
                <span className="inline-block h-3 w-1.5 animate-pulse bg-primary/60 align-text-bottom" />
              )}
            </pre>
          </div>
        ) : isQueued ? (
          <div className="h-28 rounded-md border border-dashed bg-muted/30 p-2 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">等待前面的模型测试完成...</span>
          </div>
        ) : isSkipped ? (
          <div className="h-28 rounded-md border border-dashed bg-muted/30 p-2 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">该模型已被跳过</span>
          </div>
        ) : status === "idle" ? (
          <p className="text-xs text-muted-foreground">等待测试...</p>
        ) : isRunning ? (
          <div className="h-28 rounded-md border bg-muted/50 p-2 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">等待响应中...</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
});
