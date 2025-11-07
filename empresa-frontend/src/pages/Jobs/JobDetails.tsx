import { ArrowLeft, Edit, Trash2, Users, Calendar, Briefcase, MapPin, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock data - em produção, isso viria de uma API
const mockJob = {
  id: "1",
  title: "Desenvolvedor Full Stack Senior",
  description: "Desenvolvimento de aplicações web modernas com React e Node.js",
  status: "active" as const,
  candidates: 24,
  date: "2024-01-15",
  type: "CLT",
  salary: "R$ 8.000 - R$ 12.000",
  location: "São Paulo - SP (Remoto)",
  requirements: "Experiência com React, Node.js, TypeScript, AWS, Docker. Conhecimento em arquitetura de microsserviços.",
};

const statusConfig = {
  active: { label: "Ativa", variant: "default" as const },
  closed: { label: "Encerrada", variant: "secondary" as const },
  syncing: { label: "Sincronizando", variant: "outline" as const },
};

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = mockJob; // Em produção, buscar pelo ID

  const handleEdit = () => {
    navigate(`/vagas/${id}/editar`);
  };

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
              <Badge variant={statusConfig[job.status].variant}>{statusConfig[job.status].label}</Badge>
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
              <CardTitle>Requisitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
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
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => navigate(`/candidaturas?job=${job.id}`)}>
                Ver Candidatos
              </Button>
              <Button className="w-full" variant="outline">
                Compartilhar Vaga
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

