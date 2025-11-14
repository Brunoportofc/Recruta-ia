import { ArrowLeft, Edit, Trash2, Users, Calendar, Briefcase, MapPin, DollarSign } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import mockVagas from "@/mockData/mockVagas.json";

const mockJob = {
  id: "1",
  title: "Fallback",
  description: "Desenvolvimento de aplicações web modernas com React e Node.js",
  status: "active" as const,
  candidates: 24,
  date: "2024-01-15",
  type: "CLT",
  salary: "R$ 8.000 - R$ 12.000",
  location: "São Paulo - SP (Remoto)",
  requirements: "Experiência com React, Node.js, TypeScript, AWS, Docker. Conhecimento em arquitetura de microsserviços.",
  job_config: { tests: { test1: false, test2: false, test3: false, test4: false }, interviews_count: 1, active_days: 30 },
};

const statusConfig = {
  active: { label: "Ativa", variant: "default" as const },
  closed: { label: "Encerrada", variant: "secondary" as const },
  syncing: { label: "Rascunho", variant: "outline" as const },
};

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const found = (mockVagas.vagas || []).find((v: any) => String(v.id) === String(id) || String(v.id) === `job-${id}` || String(v.id).endsWith(String(id)));
  console.log("Found job:", found);
  const job = found
    ? {
        id: String(found.id),
        title: found.job_title,
        description: found.description,
        status: (found.status as any) || "active",
        candidates: (found.applicationsCount ?? (found.candidateIds ? found.candidateIds.length : undefined)) || 0,
        date: found.created_at,
        type: found.employment_status,
        salary: found.salario,
        location: found.location,
        requirements: (found.screening_questions && found.screening_questions.map((q: any) => q.text).join("\n")) || "",
        job_config: found.job_config || { tests: { test1: false, test2: false, test3: false, test4: false }, interviews_count: 1, active_days: 30 },
      }
    : mockJob;

  const handleEdit = () => {
    navigate(`/vagas/${id}/editar`);
  };

  // Navigation state can carry the status (passed from the list) — prefer it when present
  const navStateStatus = (location.state as any)?.status;
  const effectiveStatus = navStateStatus ?? job.status;
  console.log("Effective status:", effectiveStatus);
  const isDraft = ["syncing", "rascunho", "draft"].includes(String(effectiveStatus));
  const isClosed = String(effectiveStatus) === "closed";
  const isActive = String(effectiveStatus) === "active";

  const handleDelete = () => {
    // Aqui seria a lógica de deletar
    if (confirm("Tem certeza que deseja excluir esta vaga?")) {
      navigate("/vagas");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vagas")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              
            </div>
            <p className="text-muted-foreground">Detalhes da vaga</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>
            <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Testes ativados</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {Object.entries(job.job_config?.tests || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 px-2 py-1 border rounded-md">
                      <span className="text-sm">{k.replace(/test(\d)/, 'Teste $1')}</span>
                      <Badge variant={v ? "default" : "secondary"}>{v ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entrevistas</span>
                <span className="font-medium">{job.job_config?.interviews_count ?? "-"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dias ativos</span>
                <span className="font-medium">{job.job_config?.active_days ?? "-"}</span>
              </div>
            </CardContent>
          </Card>

          
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{job.type}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Salário</p>
                  <p className="font-medium">{job.salary || "Não informado"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">{job.location || "Não informado"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Candidatos</p>
                  <p className="font-medium">{job.candidates}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Publicada em</p>
                  <p className="font-medium">{new Date(job.date).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        

          <Card>
            <CardHeader>
             
            </CardHeader>
            <CardContent className="space-y-2">
              {isDraft ? (
                // Se for rascunho/draft — mostrar somente o botão de publicar
                <Button className="w-full" variant="default">
                  Publicar no LinkedIn
                </Button>
              ) : isClosed ? (
                // Se estiver encerrada — somente ver candidatos
                <Button className="w-full" variant="outline" onClick={() => navigate(`/candidaturas?job=${id ?? job.id}`)}>
                  Ver Candidatos
                </Button>
              ) : (
                // Caso padrão (ativa ou outro) — ver candidatos sempre e, se ativa, mostrar compartilhar
                <>
                  <Button className="w-full" variant="outline" onClick={() => navigate(`/candidaturas?job=${id ?? job.id}`)}>
                    Ver Candidatos
                  </Button>
                  {isActive && (
                    <Button className="w-full" variant="outline">
                      Compartilhar Vaga
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

