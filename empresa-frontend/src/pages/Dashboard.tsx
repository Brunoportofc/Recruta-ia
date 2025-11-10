import { Briefcase, Users, FileText, TrendingUp, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentJobsList } from "@/components/dashboard/RecentJobsList";
import { CandidatesChart } from "@/components/dashboard/CandidatesChart";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {user?.nome || user?.name || 'Empresa'}!
        </h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma FACTORIA
        </p>
      </div>

      {/* Status da conexão com LinkedIn */}
      {user?.unipileConnected && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            LinkedIn Conectado
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Sua conta LinkedIn foi conectada com sucesso em{" "}
            {new Date(user.unipileConnectedAt!).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </AlertDescription>
        </Alert>
      )}

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
