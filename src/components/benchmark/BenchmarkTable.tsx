import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TestResult } from "@/lib/types";
import { Trophy, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortField = "cps" | "ttft_ms" | "totalTime_ms" | "outputChars" | "timestamp";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: { field: SortField; label: string; defaultDir: SortDir }[] = [
  { field: "cps", label: "速度 (字符/秒)", defaultDir: "desc" },
  { field: "ttft_ms", label: "TTFT (ms)", defaultDir: "asc" },
  { field: "totalTime_ms", label: "总耗时 (ms)", defaultDir: "asc" },
  { field: "outputChars", label: "输出字符", defaultDir: "desc" },
  { field: "timestamp", label: "测试时间", defaultDir: "desc" },
];

interface BenchmarkTableProps {
  results: TestResult[];
}

export function BenchmarkTable({ results }: BenchmarkTableProps) {
  const [sortField, setSortField] = useState<SortField>("cps");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.status === "error" && b.status !== "error") return 1;
      if (a.status !== "error" && b.status === "error") return -1;
      if (a.status === "error" && b.status === "error") return 0;

      const va = a[sortField] as number;
      const vb = b[sortField] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [results, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      const col = SORT_COLUMNS.find((c) => c.field === field);
      setSortDir(col?.defaultDir ?? "desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          暂无测试数据，请先进行速度测试
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">排名</TableHead>
            <TableHead>供应商</TableHead>
            <TableHead>模型</TableHead>
            {SORT_COLUMNS.map((col) => (
              <TableHead
                key={col.field}
                className={`${col.field === "timestamp" ? "" : "text-right"} cursor-pointer select-none hover:bg-muted/50 transition-colors`}
                onClick={() => handleSort(col.field)}
              >
                <div className={`inline-flex items-center ${col.field === "timestamp" ? "" : "justify-end"}`}>
                  {col.label}
                  <SortIcon field={col.field} />
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((result, index) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-1">
                  {index < 3 && result.status === "success" && (
                    <Trophy
                      className={`h-4 w-4 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                            ? "text-gray-400"
                            : "text-amber-700"
                      }`}
                    />
                  )}
                  <span>{index + 1}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {result.providerName}
              </TableCell>
              <TableCell className="font-mono text-sm max-w-[200px] truncate">
                {result.modelId}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {result.status === "success" ? result.cps : "-"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {result.status === "success" ? result.ttft_ms : "-"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {result.status === "success" ? result.totalTime_ms : "-"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {result.status === "success" ? result.outputChars : "-"}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {new Date(result.timestamp).toLocaleString("zh-CN")}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    result.status === "success" ? "secondary" : "destructive"
                  }
                  className="text-xs"
                >
                  {result.status === "success" ? "成功" : "失败"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
