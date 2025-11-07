import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Job {
  id: string;
  title: string;
  description: string;
  status: "active" | "closed" | "syncing";
  candidates: number;
  date: string;
  type: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Desenvolvedor Full Stack Senior",
    description: "Desenvolvimento de aplicações web modernas com React e Node.js",
    status: "active",
    candidates: 24,
    date: "2024-01-15",
    type: "CLT",
  },
  {
    id: "2",
    title: "Designer UX/UI Pleno",
    description: "Design de interfaces para aplicações SaaS B2B",
    status: "active",
    candidates: 18,
    date: "2024-01-14",
    type: "PJ",
  },
  {
    id: "3",
    title: "Gerente de Produtos",
    description: "Gestão de produtos digitais e roadmap estratégico",
    status: "syncing",
    candidates: 12,
    date: "2024-01-13",
    type: "CLT",
  },
];

const statusConfig = {
  active: { label: "Ativa", variant: "default" as const },
  closed: { label: "Encerrada", variant: "secondary" as const },
  syncing: { label: "Sincronizando", variant: "outline" as const },
};

export default function JobsList() {
  const navigate = useNavigate();

  const handleCreateJob = () => {
    navigate("/vagas/nova");
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/vagas/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vagas</h1>
          <p className="text-muted-foreground">Gerencie suas vagas publicadas</p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Vaga
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar vagas..." className="pl-10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockJobs.map((job) => (
          <Card
            key={job.id}
            className="hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full"
            onClick={() => handleJobClick(job.id)}
          >
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant={statusConfig[job.status].variant} className="shrink-0">
                  {statusConfig[job.status].label}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2 mb-2">{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Candidatos</span>
                  <span className="font-medium">{job.candidates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{job.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{new Date(job.date).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

