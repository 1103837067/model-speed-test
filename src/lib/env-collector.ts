import type { NetworkEnv } from "./types";

interface IpApiResponse {
  query: string;
  country: string;
  regionName: string;
  city: string;
  isp: string;
  org: string;
}

interface NavigatorConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

async function fetchIpInfo(signal?: AbortSignal): Promise<{
  ip: string;
  location: string;
  isp: string;
}> {
  try {
    const res = await fetch(
      "http://ip-api.com/json/?fields=query,country,regionName,city,isp,org",
      { signal },
    );
    const data = (await res.json()) as IpApiResponse;
    const parts = [data.city, data.regionName, data.country].filter(Boolean);
    return {
      ip: data.query || "",
      location: parts.join(", "),
      isp: data.isp || data.org || "",
    };
  } catch {
    return { ip: "", location: "", isp: "" };
  }
}

function getConnectionInfo(): Pick<NetworkEnv, "effectiveType" | "downlinkMbps" | "rttMs"> {
  const conn = (navigator as unknown as { connection?: NavigatorConnection })
    .connection;
  return {
    effectiveType: conn?.effectiveType ?? "unknown",
    downlinkMbps: conn?.downlink ?? 0,
    rttMs: conn?.rtt ?? 0,
  };
}

export async function collectEnv(): Promise<NetworkEnv> {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 3000);

  const ipInfo = await fetchIpInfo(ac.signal);
  clearTimeout(timeout);

  return {
    ...ipInfo,
    ...getConnectionInfo(),
    userAgent: navigator.userAgent,
  };
}
