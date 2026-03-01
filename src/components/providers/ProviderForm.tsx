import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ProviderConfig, ProviderType } from "@/lib/types";

const PROVIDER_TYPE_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: "openai-compatible", label: "OpenAI 兼容" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google Gemini" },
];

const DEFAULT_BASE_URLS: Record<ProviderType, string> = {
  "openai-compatible": "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
};

interface ProviderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (provider: ProviderConfig) => void;
  editingProvider?: ProviderConfig | null;
}

export function ProviderForm({
  open,
  onOpenChange,
  onSave,
  editingProvider,
}: ProviderFormProps) {
  const [name, setName] = useState(editingProvider?.name ?? "");
  const [type, setType] = useState<ProviderType>(
    editingProvider?.type ?? "openai-compatible",
  );
  const [baseURL, setBaseURL] = useState(
    editingProvider?.baseURL ?? DEFAULT_BASE_URLS["openai-compatible"],
  );
  const [apiKey, setApiKey] = useState(editingProvider?.apiKey ?? "");

  const handleTypeChange = (value: ProviderType) => {
    setType(value);
    if (!editingProvider) {
      setBaseURL(DEFAULT_BASE_URLS[value]);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !apiKey.trim()) return;

    const provider: ProviderConfig = {
      id: editingProvider?.id ?? uuidv4(),
      name: name.trim(),
      type,
      baseURL: baseURL.trim(),
      apiKey: apiKey.trim(),
      models: editingProvider?.models ?? [],
    };

    onSave(provider);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    if (!editingProvider) {
      setName("");
      setType("openai-compatible");
      setBaseURL(DEFAULT_BASE_URLS["openai-compatible"]);
      setApiKey("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {editingProvider ? "编辑供应商" : "添加供应商"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: OpenAI, DeepSeek, Claude..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">协议类型</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="baseURL">Base URL</Label>
            <Input
              id="baseURL"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.example.com/v1"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !apiKey.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
