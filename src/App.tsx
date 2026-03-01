import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { GettingStarted } from "@/components/layout/GettingStarted";
import { ProviderList } from "@/components/providers/ProviderList";
import { TestPage } from "@/components/testing/TestPage";
import { BenchmarkPage } from "@/components/benchmark/BenchmarkPage";
import { useProviders } from "@/hooks/useProviders";
import { useTestRunner } from "@/hooks/useTestRunner";
import { Home, Settings, FlaskConical, BarChart3 } from "lucide-react";

export default function App() {
  const providerState = useProviders();
  const testRunner = useTestRunner();
  const [activeTab, setActiveTab] = useState("home");
  const prevReportId = useRef<string | null>(null);

  useEffect(() => {
    if (
      testRunner.lastReportId &&
      testRunner.lastReportId !== prevReportId.current
    ) {
      prevReportId.current = testRunner.lastReportId;
      setActiveTab("benchmark");
    }
  }, [testRunner.lastReportId]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="home">
              <Home className="mr-1.5 h-4 w-4" />
              首页
            </TabsTrigger>
            <TabsTrigger value="providers">
              <Settings className="mr-1.5 h-4 w-4" />
              供应商配置
            </TabsTrigger>
            <TabsTrigger value="testing">
              <FlaskConical className="mr-1.5 h-4 w-4" />
              速度测试
            </TabsTrigger>
            <TabsTrigger value="benchmark">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              测试报告
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <GettingStarted />
          </TabsContent>

          <TabsContent value="providers">
            <ProviderList {...providerState} />
          </TabsContent>

          <TabsContent value="testing">
            <TestPage
              providers={providerState.providers}
              testRunner={testRunner}
            />
          </TabsContent>

          <TabsContent value="benchmark">
            <BenchmarkPage autoSelectReportId={testRunner.lastReportId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
