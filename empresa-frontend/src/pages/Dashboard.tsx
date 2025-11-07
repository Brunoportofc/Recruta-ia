import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentJobsList } from "@/components/dashboard/RecentJobsList";
import { CandidatesChart } from "@/components/dashboard/CandidatesChart";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da plataforma FACTORIA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total de Vagas" value={24} icon={Briefcase} trend={{ value: 12, positive: true }} />
        <MetricCard title="Candidatos Ativos" value={156} icon={Users} trend={{ value: 8, positive: true }} />
        <MetricCard title="Currículos Processados" value={342} icon={FileText} trend={{ value: 23, positive: true }} />
        <MetricCard title="Taxa de Aprovação" value="68%" icon={TrendingUp} trend={{ value: 5, positive: true }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CandidatesChart />
        <RecentJobsList />
      </div>
    </div>
  );
}
