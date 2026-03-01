import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelPickerTree } from "./ModelPickerTree";
import { TestResultCard } from "./TestResultCard";
import type { TestMode } from "@/hooks/useTestRunner";
import type { ProviderConfig } from "@/lib/types";
import { Play, Square, Zap, ListOrdered, SkipForward } from "lucide-react";

interface SelectedModel {
  providerId: string;
  modelId: string;
}

interface TestPageProps {
  providers: ProviderConfig[];
  testRunner: ReturnType<typeof import("@/hooks/useTestRunner").useTestRunner>;
}

export function TestPage({ providers, testRunner }: TestPageProps) {
  const [selected, setSelected] = useState<SelectedModel[]>([]);
  const [prompt, setPrompt] = useState(
    "请用中文简短解释什么是量子计算。",
  );
  const [mode, setMode] = useState<TestMode>("concurrent");
  const { testStates, isRunning, runTests, stopTests, skipCurrent, currentTestKey } = testRunner;

  const handleStart = () => {
    const models = selected.map((s) => {
      const provider = providers.find((p) => p.id === s.providerId)!;
      return { provider, modelId: s.modelId };
    });

    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [{ role: "user", content: prompt }];

    runTests(models, messages, mode);
  };

  const stateEntries = Array.from(testStates.entries());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">速度测试</h2>
        <p className="text-sm text-muted-foreground">
          选择模型、配置对话内容，然后开始测试
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">选择模型</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelPickerTree
              providers={providers}
              selected={selected}
              onSelectedChange={setSelected}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">对话内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">用户消息</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入要发送给模型的消息..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>测试模式</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "concurrent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("concurrent")}
                  disabled={isRunning}
                  className="flex-1"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  并发
                  {mode === "concurrent" && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                      当前
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={mode === "sequential" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("sequential")}
                  disabled={isRunning}
                  className="flex-1"
                >
                  <ListOrdered className="mr-1.5 h-3.5 w-3.5" />
                  逐个
                  {mode === "sequential" && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                      当前
                    </Badge>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "concurrent"
                  ? "所有模型同时发起请求，速度快但可能受浏览器并发限制"
                  : "逐个测试，一个完成后再测下一个，结果更稳定"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  disabled={selected.length === 0 || !prompt.trim()}
                >
                  <Play className="mr-1.5 h-4 w-4" />
                  开始测试 ({selected.length} 个模型)
                </Button>
              ) : (
                <>
                  <Button variant="destructive" onClick={stopTests}>
                    <Square className="mr-1.5 h-4 w-4" />
                    停止全部
                  </Button>
                  {mode === "sequential" && (
                    <Button variant="outline" onClick={skipCurrent}>
                      <SkipForward className="mr-1.5 h-4 w-4" />
                      跳过当前
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {stateEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">测试结果</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stateEntries.map(([key, state]) => (
              <TestResultCard
                key={key}
                state={state}
                canSkip={mode === "sequential" && key === currentTestKey}
                onSkip={skipCurrent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
