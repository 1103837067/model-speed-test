import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchModels } from "@/lib/ai/model-fetcher";
import type { ProviderConfig } from "@/lib/types";
import { RefreshCw, Plus, X, Loader2 } from "lucide-react";

interface ModelSelectorProps {
  provider: ProviderConfig;
  onModelsChange: (models: string[]) => void;
}

export function ModelSelector({ provider, onModelsChange }: ModelSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newModel, setNewModel] = useState("");

  const handleFetchModels = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchModels(provider);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    if (result.models.length > 0) {
      onModelsChange(result.models);
    }
  };

  const handleAddModel = () => {
    const model = newModel.trim();
    if (!model || provider.models.includes(model)) return;
    onModelsChange([...provider.models, model]);
    setNewModel("");
  };

  const handleRemoveModel = (model: string) => {
    onModelsChange(provider.models.filter((m) => m !== model));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFetchModels}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          获取模型列表
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newModel}
          onChange={(e) => setNewModel(e.target.value)}
          placeholder="手动添加模型名称..."
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddModel();
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddModel}
          disabled={!newModel.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {provider.models.length > 0 && (
        <ScrollArea className="max-h-48">
          <div className="flex flex-wrap gap-1.5">
            {provider.models.map((model) => (
              <Badge key={model} variant="secondary" className="gap-1 pr-1">
                <span className="max-w-[200px] truncate text-xs">{model}</span>
                <button
                  onClick={() => handleRemoveModel(model)}
                  className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </ScrollArea>
      )}

      {provider.models.length === 0 && (
        <p className="text-sm text-muted-foreground">
          暂无模型，请点击「获取模型列表」或手动添加
        </p>
      )}
    </div>
  );
}
