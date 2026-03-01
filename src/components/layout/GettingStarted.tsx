import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Shield, Wifi, ArrowRight } from "lucide-react";

export function GettingStarted() {
  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          快速开始
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          纯浏览器端 LLM 速度测试工具。配好 API Key，选模型，点测试——对比不同模型在你的网络环境下的实际输出速度。
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2 rounded-md border p-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
            <div>
              <p className="text-sm font-medium">添加供应商</p>
              <p className="text-xs text-muted-foreground">填写 Base URL 和 API Key，支持 OpenAI 兼容 / Gemini / Anthropic</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border p-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
            <div>
              <p className="text-sm font-medium">选择模型</p>
              <p className="text-xs text-muted-foreground">可自动拉取可用模型列表，或手动输入模型名称</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border p-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">3</span>
            <div>
              <p className="text-sm font-medium">开始测试</p>
              <p className="text-xs text-muted-foreground">批量对比 TTFT、输出速度，结果自动保存为报告</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 rounded-md bg-muted/50 p-3">
          <p className="text-xs font-medium">注意事项</p>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Shield className="mt-0.5 h-3 w-3 shrink-0" />
            <span>API Key 仅存在你的浏览器本地，不会发往任何第三方服务器</span>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Wifi className="mt-0.5 h-3 w-3 shrink-0" />
            <span>需要目标 API 支持 CORS（Anthropic 官方 API 不支持浏览器直连，需走代理）</span>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
            <span>测试结果反映端到端体验（含网络延迟），不等于模型推理速度</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
