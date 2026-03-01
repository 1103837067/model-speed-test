import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModelSelector } from "./ModelSelector";
import type { ProviderConfig } from "@/lib/types";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  "openai-compatible": "OpenAI 兼容",
  anthropic: "Anthropic",
  google: "Google Gemini",
};

interface ProviderCardProps {
  provider: ProviderConfig;
  onEdit: (provider: ProviderConfig) => void;
  onDelete: (id: string) => void;
  onUpdate: (provider: ProviderConfig) => void;
}

export function ProviderCard({
  provider,
  onEdit,
  onDelete,
  onUpdate,
}: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleModelsChange = (models: string[]) => {
    onUpdate({ ...provider, models });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{provider.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[provider.type] ?? provider.type}
              </Badge>
              <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                {provider.baseURL}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(provider)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(provider.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{provider.models.length} 个模型</span>
          <span>·</span>
          <span>API Key: ****{provider.apiKey.slice(-4)}</span>
        </div>

        <Separator className="my-3" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="mr-1.5 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-1.5 h-4 w-4" />
          )}
          模型管理
        </Button>

        {expanded && (
          <div className="mt-3">
            <ModelSelector
              provider={provider}
              onModelsChange={handleModelsChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
