import { Checkbox } from "@/components/ui/checkbox";
import type { ProviderConfig } from "@/lib/types";

interface SelectedModel {
  providerId: string;
  modelId: string;
}

interface ModelPickerTreeProps {
  providers: ProviderConfig[];
  selected: SelectedModel[];
  onSelectedChange: (selected: SelectedModel[]) => void;
}

export function ModelPickerTree({
  providers,
  selected,
  onSelectedChange,
}: ModelPickerTreeProps) {
  const isSelected = (providerId: string, modelId: string) =>
    selected.some(
      (s) => s.providerId === providerId && s.modelId === modelId,
    );

  const isProviderAllSelected = (provider: ProviderConfig) =>
    provider.models.length > 0 &&
    provider.models.every((m) => isSelected(provider.id, m));

  const isProviderSomeSelected = (provider: ProviderConfig) =>
    provider.models.some((m) => isSelected(provider.id, m));

  const toggleModel = (providerId: string, modelId: string) => {
    if (isSelected(providerId, modelId)) {
      onSelectedChange(
        selected.filter(
          (s) => !(s.providerId === providerId && s.modelId === modelId),
        ),
      );
    } else {
      onSelectedChange([...selected, { providerId, modelId }]);
    }
  };

  const toggleProvider = (provider: ProviderConfig) => {
    if (isProviderAllSelected(provider)) {
      onSelectedChange(
        selected.filter((s) => s.providerId !== provider.id),
      );
    } else {
      const existing = selected.filter((s) => s.providerId !== provider.id);
      const newModels = provider.models.map((m) => ({
        providerId: provider.id,
        modelId: m,
      }));
      onSelectedChange([...existing, ...newModels]);
    }
  };

  const selectAll = () => {
    const all: SelectedModel[] = [];
    for (const p of providers) {
      for (const m of p.models) {
        all.push({ providerId: p.id, modelId: m });
      }
    }
    onSelectedChange(all);
  };

  const deselectAll = () => {
    onSelectedChange([]);
  };

  const providersWithModels = providers.filter((p) => p.models.length > 0);

  if (providersWithModels.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        还没有可用的模型，请先在「供应商配置」中添加供应商和模型
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={selectAll}
          className="text-primary hover:underline"
        >
          全选
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={deselectAll}
          className="text-primary hover:underline"
        >
          取消全选
        </button>
        <span className="ml-auto text-muted-foreground">
          已选 {selected.length} 个模型
        </span>
      </div>
      <div className="h-[320px] overflow-y-auto rounded-md border p-2">
        <div className="space-y-3">
          {providersWithModels.map((provider) => (
            <div key={provider.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    isProviderAllSelected(provider)
                      ? true
                      : isProviderSomeSelected(provider)
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={() => toggleProvider(provider)}
                />
                <span className="text-sm font-medium">{provider.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({provider.models.length})
                </span>
              </div>
              <div className="ml-6 space-y-0.5">
                {provider.models.map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected(provider.id, model)}
                      onCheckedChange={() => toggleModel(provider.id, model)}
                    />
                    <span className="text-sm truncate max-w-[240px]">
                      {model}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
