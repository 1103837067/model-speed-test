import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "./ProviderCard";
import { ProviderForm } from "./ProviderForm";
import type { ProviderConfig } from "@/lib/types";
import { Plus } from "lucide-react";

interface ProviderListProps {
  providers: ProviderConfig[];
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (provider: ProviderConfig) => void;
  removeProvider: (id: string) => void;
}

export function ProviderList({
  providers,
  addProvider,
  updateProvider,
  removeProvider,
}: ProviderListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProviderConfig | null>(null);

  const handleEdit = (provider: ProviderConfig) => {
    setEditing(provider);
    setFormOpen(true);
  };

  const handleSave = (provider: ProviderConfig) => {
    if (editing) {
      updateProvider(provider);
    } else {
      addProvider(provider);
    }
    setEditing(null);
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">供应商配置</h2>
          <p className="text-sm text-muted-foreground">
            配置 AI 供应商的连接信息和可用模型
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          添加供应商
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            还没有配置供应商，点击上方按钮添加
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={handleEdit}
              onDelete={removeProvider}
              onUpdate={updateProvider}
            />
          ))}
        </div>
      )}

      <ProviderForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={handleOpenChange}
        onSave={handleSave}
        editingProvider={editing}
      />
    </div>
  );
}
