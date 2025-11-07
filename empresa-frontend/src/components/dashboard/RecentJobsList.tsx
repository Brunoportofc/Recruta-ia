import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Job {
  id: string;
  title: string;
  status: "active" | "closed" | "syncing";
  candidates: number;
  date: string;
}

const mockJobs: Job[] = [
  { id: "1", title: "Desenvolvedor Full Stack Senior", status: "active", candidates: 24, date: "2024-01-15" },
  { id: "2", title: "Designer UX/UI Pleno", status: "active", candidates: 18, date: "2024-01-14" },
  { id: "3", title: "Gerente de Produtos", status: "syncing", candidates: 12, date: "2024-01-13" },
  { id: "4", title: "Analista de Dados Junior", status: "closed", candidates: 45, date: "2024-01-10" },
];

const statusConfig = {
  active: { label: "Ativa", variant: "default" as const },
  closed: { label: "Encerrada", variant: "secondary" as const },
  syncing: { label: "Sincronizando", variant: "outline" as const },
};

export function RecentJobsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vagas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.candidates} candidatos</p>
              </div>
              <Badge variant={statusConfig[job.status].variant}>{statusConfig[job.status].label}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
