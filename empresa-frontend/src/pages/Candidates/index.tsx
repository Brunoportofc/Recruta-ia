import { Search, Filter, ChevronLeft, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import mockVagasData from "@/mockData/mockVagas.json";
import mockCandidatosData from "@/mockData/mockCandidatos.json";

interface Candidate {
  id: string;
  nome_completo: string;
  email: string;
  created_at: string;
  score: number;
}

interface Job {
  id: string;
  job_title: string;
  company: string;
  location: string;
  candidateIds: string[];
  created_at: string;
  applicationsCount: number;
}


const statusConfig = {
  analyzing: { label: "Em Análise", variant: "outline" as const },
  test_sent: { label: "Teste Enviado", variant: "secondary" as const },
  approved: { label: "Aprovado", variant: "default" as const },
  rejected: { label: "Reprovado", variant: "destructive" as const },
};

export default function CandidatesList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const mockVagas = mockVagasData.vagas.map((vaga: any) => ({
    id: vaga.id,
    job_title: vaga.job_title,
    company: vaga.company,
    location: vaga.location,
    candidateIds: vaga.candidateIds || [],
    created_at: vaga.created_at,
    applicationsCount: vaga.applicationsCount || 0,
  }));

  const mockAllCandidates: { [key: string]: Candidate } = {};
  mockCandidatosData.forEach((candidato: any) => {
    mockAllCandidates[candidato.id] = {
      id: candidato.id,
      nome_completo: candidato.nome_completo,
      email: candidato.email,
      created_at: candidato.created_at,
      score: candidato.score,
    };
  });

  // Função utilitária para resolver jobParam em um job id válido
  const resolveJobIdFromParam = (jobParam: string | null) => {
    if (!jobParam) return null;

    const exact = mockVagas.find((j: any) => j.id === jobParam);
    if (exact) return exact.id;

    const byContains = mockVagas.find((j: any) => j.id.includes(jobParam));
    if (byContains) return byContains.id;

    return null;
  };

  const initialJobParam = searchParams.get("job");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() =>
    resolveJobIdFromParam(initialJobParam)
  );

  useEffect(() => {
    const jobParam = searchParams.get("job");
    const resolved = resolveJobIdFromParam(jobParam);
    if (resolved !== selectedJobId) {
      setSelectedJobId(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedJob = selectedJobId
    ? mockVagas.find((job: any) => job.id === selectedJobId)
    : null;

  const jobCandidates = selectedJob
    ? selectedJob.candidateIds
        .map((id: string) => mockAllCandidates[id])
        .filter(Boolean)
        .filter(
          (c: Candidate) =>
            c &&
            c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  if (selectedJobId && selectedJob) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedJobId(null);
              navigate("/vagas");
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedJob.job_title}</h1>
            <p className="text-muted-foreground">
              {selectedJob.applicationsCount} candidato
              {selectedJob.applicationsCount !== 1 ? "s" : ""} candidatado
              {selectedJob.applicationsCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar candidatos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jobCandidates.length > 0 ? (
            jobCandidates.map((candidate: Candidate) => (
              <Card key={candidate.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {candidate.nome_completo}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {candidate.email}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Pontuação IA
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">
                        {candidate.score}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Candidatura em
                    </p>
                    <p className="text-xs">
                      {new Date(candidate.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Testes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Relatório
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Currículo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum candidato encontrado
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se não há vaga selecionada, mostra TODOS os candidatos
  const allCandidates = Object.values(mockAllCandidates).filter((c: Candidate) =>
    c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCandidateJobs = (candidateId: string) => {
    return mockVagas.filter((j: any) => j.candidateIds.includes(candidateId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidatos</h1>
        <p className="text-muted-foreground">Lista de todos os candidatos cadastrados</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar candidatos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allCandidates.length > 0 ? (
          allCandidates.map((candidate: Candidate) => {
            const jobs = getCandidateJobs(candidate.id);
            return (
              <Card key={candidate.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {candidate.nome_completo}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {candidate.email}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Pontuação IA
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">
                        {candidate.score}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Vagas</p>
                    {jobs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {jobs.map((j: any) => (
                          <Badge
                            key={j.id}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80"
                            onClick={() => setSelectedJobId(j.id)}
                          >
                            {j.job_title}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">—</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Candidatura em
                    </p>
                    <p className="text-xs">
                      {new Date(candidate.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Testes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Relatório
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Currículo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum candidato encontrado
          </div>
        )}
      </div>
    </div>
  );
}

