import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Globe, Wifi, MapPin } from "lucide-react";

interface HostInfo {
  ip: string;
  location: string;
  isp: string;
  effectiveType: string;
  downlink: number;
}

export function AppHeader() {
  const [info, setInfo] = useState<HostInfo>({
    ip: "",
    location: "",
    isp: "",
    effectiveType: "",
    downlink: 0,
  });

  useEffect(() => {
    const conn = (navigator as unknown as {
      connection?: { effectiveType?: string; downlink?: number };
    }).connection;
    if (conn) {
      setInfo((p) => ({
        ...p,
        effectiveType: conn.effectiveType ?? "",
        downlink: conn.downlink ?? 0,
      }));
    }

    const ac = new AbortController();
    fetch(
      "http://ip-api.com/json/?fields=query,country,regionName,city,isp,org",
      { signal: ac.signal },
    )
      .then((r) => r.json() as Promise<{
        query: string;
        country: string;
        regionName: string;
        city: string;
        isp: string;
        org: string;
      }>)
      .then((d) => {
        const parts = [d.city, d.regionName, d.country].filter(Boolean);
        setInfo((p) => ({
          ...p,
          ip: d.query || "",
          location: parts.join(", "),
          isp: d.isp || d.org || "",
        }));
      })
      .catch(() => {});

    return () => ac.abort();
  }, []);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">LLM TPS Benchmark</h1>
          <span className="ml-2 text-sm text-muted-foreground hidden sm:inline">
            AI 模型速度测试工具
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {info.ip && (
            <Badge variant="outline" className="font-mono text-[11px] gap-1">
              <Globe className="h-3 w-3" />
              {info.ip}
            </Badge>
          )}
          {info.location && (
            <Badge variant="outline" className="text-[11px] gap-1 hidden md:inline-flex">
              <MapPin className="h-3 w-3" />
              {info.location}
            </Badge>
          )}
          {info.isp && (
            <Badge variant="outline" className="text-[11px] gap-1 hidden lg:inline-flex">
              {info.isp}
            </Badge>
          )}
          {info.effectiveType && (
            <Badge variant="outline" className="text-[11px] gap-1">
              <Wifi className="h-3 w-3" />
              {info.effectiveType}
              {info.downlink > 0 && ` ${info.downlink}Mbps`}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
