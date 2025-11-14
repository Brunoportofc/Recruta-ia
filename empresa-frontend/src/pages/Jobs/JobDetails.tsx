import { ArrowLeft, Edit, Trash2, Users, Calendar, Briefcase, MapPin, DollarSign, Share2, Linkedin, Loader2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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
  closed: { label: "Encerrada", variant: "destructive" as const },
  rascunho: { label: "Rascunho", variant: "outline" as const },
  syncing: { label: "Rascunho", variant: "outline" as const },
};

const employmentStatusLabels: Record<string, string> = {
  FULL_TIME: "Tempo Integral",
  PART_TIME: "Meio Período",
  CONTRACT: "Contrato",
  TEMPORARY: "Temporário",
  OTHER: "Outro",
  VOLUNTEER: "Voluntário",
  INTERNSHIP: "Estágio",
};

const workplaceLabels: Record<string, string> = {
  ON_SITE: "Presencial",
  HYBRID: "Híbrido",
  REMOTE: "Remoto",
};

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("rascunho");

  // Buscar vaga da API
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3001/jobs/${id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar vaga');
        }

        const data = await response.json();
        console.log("✅ Vaga carregada da API:", data);

        // Busca contagem de candidaturas
        let candidatosCount = 0;
        try {
          const candidaturasResponse = await fetch(`http://localhost:3001/candidatura/vaga/${id}`);
          if (candidaturasResponse.ok) {
            const candidaturasData = await candidaturasResponse.json();
            candidatosCount = candidaturasData.data?.length || 0;
            console.log('✅ Candidaturas encontradas:', candidatosCount);
          }
        } catch (error) {
          console.log('⚠️  Erro ao buscar candidaturas, usando 0:', error);
        }

        const vagaData = {
          id: data.id,
          title: data.jobTitle,
          description: data.description,
          status: data.status || "rascunho",
          candidates: candidatosCount,
          date: data.createdAt,
          type: data.employmentStatus,
          workplace: data.workplace, // ON_SITE, HYBRID, REMOTE
          salary: data.salaryAnonymous 
            ? "A combinar" 
            : data.salaryAmount 
            ? `R$ ${data.salaryAmount.toLocaleString('pt-BR')}` 
            : data.salaryMin && data.salaryMax
            ? `R$ ${data.salaryMin.toLocaleString('pt-BR')} - R$ ${data.salaryMax.toLocaleString('pt-BR')}`
            : "Não informado",
          location: data.location,
          company: data.company,
          job_config: data.jobConfig || { tests: { test1: false, test2: false, test3: false, test4: false }, interviews_count: 1, active_days: 30 },
        };

        setJob(vagaData);
        setCurrentStatus(data.status || "rascunho");
      } catch (error) {
        console.error("❌ Erro ao buscar vaga:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a vaga",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, toast]);

  const isDraft = ["syncing", "rascunho", "draft"].includes(String(currentStatus));
  const isClosed = String(currentStatus) === "closed";
  const isActive = String(currentStatus) === "active";

  // Debug: Log status
  console.log('🔍 [STATUS] currentStatus:', currentStatus, { isDraft, isClosed, isActive });

  const handleEdit = () => {
    // Não permite editar vaga ativa/publicada
    if (isActive) {
      toast({
        title: "⚠️ Edição bloqueada",
        description: "Não é possível editar vagas publicadas. Apenas vagas em rascunho podem ser editadas.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/vagas/${id}/editar`);
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta vaga?")) {
      navigate("/vagas");
    }
  };

  const handlePublish = async () => {
    try {
      console.log('📤 [PUBLISH] Publicando vaga:', id);
      
      // Atualiza status no backend
      const response = await fetch(`http://localhost:3001/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao publicar vaga');
      }

      console.log('✅ [PUBLISH] Vaga publicada com sucesso');
      
      // Atualiza estado local
      setCurrentStatus("active");
      
      toast({
        title: "✅ Vaga publicada!",
        description: "A vaga foi publicada com sucesso. Agora você pode compartilhar o link com candidatos.",
      });
    } catch (error) {
      console.error('❌ [PUBLISH] Erro ao publicar vaga:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar a vaga. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleClose = async () => {
    if (!confirm("Tem certeza que deseja encerrar esta vaga? Não será mais possível receber candidaturas.")) {
      return;
    }

    try {
      console.log('🔒 [CLOSE] Encerrando vaga:', id);
      
      // Atualiza status no backend
      const response = await fetch(`http://localhost:3001/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'closed'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao encerrar vaga');
      }

      console.log('✅ [CLOSE] Vaga encerrada com sucesso');
      
      // Atualiza estado local
      setCurrentStatus("closed");
      
      toast({
        title: "🔒 Vaga encerrada!",
        description: "A vaga foi encerrada. Não será mais possível receber novas candidaturas.",
      });
    } catch (error) {
      console.error('❌ [CLOSE] Erro ao encerrar vaga:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a vaga. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // Gera link de candidatura (candidato-frontend roda na porta 5174)
    const candidateLink = `http://localhost:5174/candidato?vaga=${job?.id}`;
    navigator.clipboard.writeText(candidateLink);
    toast({
      title: "🔗 Link copiado!",
      description: "O link de candidatura foi copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/vagas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Vaga não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Badge variant={statusConfig[currentStatus as keyof typeof statusConfig]?.variant || "outline"}>
                {statusConfig[currentStatus as keyof typeof statusConfig]?.label || currentStatus}
              </Badge>
              {job.candidates > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {job.candidates}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Detalhes da vaga</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            disabled={isActive}
            className={isActive ? "opacity-50 cursor-not-allowed" : ""}
          >
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
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.type && (
                      <Badge variant="secondary" className="font-medium">
                        {employmentStatusLabels[job.type] || job.type}
                      </Badge>
                    )}
                    {job.workplace && (
                      <Badge variant="outline" className="font-medium">
                        {workplaceLabels[job.workplace] || job.workplace}
                      </Badge>
                    )}
                  </div>
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
                  <p className="font-medium">
                    {typeof job.location === 'object' && job.location?.text 
                      ? job.location.text 
                      : job.location || "Não informado"}
                  </p>
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
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isDraft ? (
                // Se for rascunho/draft — mostrar somente o botão de publicar
                <Button className="w-full" variant="default" onClick={handlePublish}>
                  <Linkedin className="mr-2 h-4 w-4" />
                  Publicar no LinkedIn
                </Button>
              ) : isClosed ? (
                // Se estiver encerrada — somente ver candidatos
                <Button className="w-full" variant="outline" onClick={() => navigate(`/candidaturas?vaga=${id ?? job.id}`)}>
                  <Users className="mr-2 h-4 w-4" />
                  Ver Candidatos
                </Button>
              ) : (
                // Caso padrão (ativa ou outro) — ver candidatos sempre e, se ativa, mostrar compartilhar e encerrar
                <>
                  <Button className="w-full" variant="default" onClick={() => navigate(`/candidaturas?vaga=${id ?? job.id}`)}>
                    <Users className="mr-2 h-4 w-4" />
                    Ver Candidatos
                  </Button>
                  {isActive && (
                    <>
                      <Button className="w-full" variant="outline" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar Vaga
                      </Button>
                      <Button className="w-full" variant="destructive" onClick={handleClose}>
                        🔒 Encerrar Vaga
                      </Button>
                    </>
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

