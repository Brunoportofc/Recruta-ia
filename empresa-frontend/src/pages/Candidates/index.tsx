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

interface Candidate {
  id: string;
  name: string;
  email: string;
  date: string;
  status: "analyzing" | "test_sent" | "approved" | "rejected";
  score: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  candidateIds: string[];
  publishedDate: string;
  applicationsCount: number;
}

// Mock de Candidatos
const mockAllCandidates: Record<string, Candidate> = {
  "1": {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    date: "2024-01-15",
    status: "approved",
    score: 92,
  },
  "2": {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    date: "2024-01-14",
    status: "test_sent",
    score: 88,
  },
  "3": {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    date: "2024-01-13",
    status: "analyzing",
    score: 85,
  },
  "4": {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    date: "2024-01-12",
    status: "approved",
    score: 95,
  },
  "5": {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos.ferreira@email.com",
    date: "2024-01-16",
    status: "analyzing",
    score: 78,
  },
  "6": {
    id: "6",
    name: "Juliana Rocha",
    email: "juliana.rocha@email.com",
    date: "2024-01-17",
    status: "test_sent",
    score: 91,
  },
};

// Mock de Vagas com candidatos
const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Desenvolvedor Full Stack Senior",
    company: "Tech Solutions",
    location: "São Paulo - SP",
    candidateIds: ["1", "2", "3"],
    publishedDate: "2024-01-10",
    applicationsCount: 3,
  },
  {
    id: "job-2",
    title: "Analista de Dados Junior",
    company: "Tech Solutions",
    location: "Rio de Janeiro - RJ",
    candidateIds: ["4", "5"],
    publishedDate: "2024-01-12",
    applicationsCount: 2,
  },
  {
    id: "job-3",
    title: "Product Manager",
    company: "Tech Solutions",
    location: "São Paulo - SP",
    candidateIds: ["1","6"],
    publishedDate: "2024-01-11",
    applicationsCount: 2,
  },
];

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

  // Função utilitária para resolver jobParam em um job id válido (por exemplo '1' -> 'job-1')
  const resolveJobIdFromParam = (jobParam: string | null) => {
    if (!jobParam) return null;

    // Exato
    const exact = mockJobs.find((j) => j.id === jobParam);
    if (exact) return exact.id;

    // Prefixo job-{param}
    const withPrefix = mockJobs.find((j) => j.id === `job-${jobParam}`);
    if (withPrefix) return withPrefix.id;

    // EndsWith / contains
    const bySuffix = mockJobs.find((j) => j.id.endsWith(jobParam));
    if (bySuffix) return bySuffix.id;

    const byContains = mockJobs.find((j) => j.id.includes(jobParam));
    if (byContains) return byContains.id;

    // Extrai números do param (ex: '1') e tenta casar com job-{n}
    const digits = jobParam.match(/\d+/)?.[0];
    if (digits) {
      const byNumber = mockJobs.find((j) => j.id === `job-${digits}`);
      if (byNumber) return byNumber.id;
    }

    return null;
  };

  // Inicializa selectedJobId imediatamente a partir do query param, evitando flash de listagem vazia
  const initialJobParam = searchParams.get("job");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => resolveJobIdFromParam(initialJobParam));

  // Se o query param mudar durante a navegação, atualiza o selectedJobId
  useEffect(() => {
    const jobParam = searchParams.get("job");
    const resolved = resolveJobIdFromParam(jobParam);
    if (resolved !== selectedJobId) {
      setSelectedJobId(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedJob = selectedJobId ? mockJobs.find((job) => job.id === selectedJobId) : null;
  const jobCandidates = selectedJob
    ? selectedJob.candidateIds
        .map((id) => mockAllCandidates[id])
        .filter(Boolean)
        .filter((c) => c && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
              navigate('/vagas');
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedJob.title}</h1>
            <p className="text-muted-foreground">
              {selectedJob.applicationsCount} candidato{selectedJob.applicationsCount !== 1 ? "s" : ""} candidatado{selectedJob.applicationsCount !== 1 ? "s" : ""}
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

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Data de Candidatura</TableHead>
                <TableHead>Pontuação IA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobCandidates.length > 0 ? (
                jobCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell>{new Date(candidate.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{candidate.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[candidate.status].variant}>
                        {statusConfig[candidate.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Currículo
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum candidato encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  

  // Se não há vaga selecionada, mostra TODOS os candidatos (padrão da página "Candidatos")
  // Permite buscar por nome e ver para qual vaga(s) o candidato aplicou.
  const allCandidates = Object.values(mockAllCandidates).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCandidateJobs = (candidateId: string) => {
    return mockJobs.filter((j) => j.candidateIds.includes(candidateId));
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data de Candidatura</TableHead>
              <TableHead>Pontuação IA</TableHead>
              <TableHead>Vaga(s)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCandidates.length > 0 ? (
              allCandidates.map((candidate) => {
                const jobs = getCandidateJobs(candidate.id);
                return (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell>{new Date(candidate.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{candidate.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {jobs.length > 0 ? (
                        <div className="flex flex-col">
                          {jobs.map((j) => (
                            <Button
                              key={j.id}
                              variant="link"
                              className="p-0 text-sm"
                              onClick={() => setSelectedJobId(j.id)}
                              size="sm"
                            >
                              {j.title}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => {/* ver currículo (mock) */}}>
                        Ver Currículo
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum candidato encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

