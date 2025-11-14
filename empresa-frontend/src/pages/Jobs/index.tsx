import { Plus, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  jobTitle: string;
  description: string;
  status: "syncing" | "active" | "closed" | "error" | "draft" | "rascunho";
  workplace: string;
  company: string;
  createdAt: string;
  linkedinUrl?: string;
}

const statusConfig = {
  active: { label: "Ativa", variant: "default" as const },
  closed: { label: "Encerrada", variant: "destructive" as const },
  rascunho: { label: "Rascunho", variant: "outline" as const },
  draft: { label: "Rascunho", variant: "outline" as const },
  syncing: { label: "Sincronizando", variant: "secondary" as const },
  error: { label: "Erro", variant: "destructive" as const },
};

export default function JobsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:3001/jobs');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar vagas');
      }

      const result = await response.json();
      setJobs(result.data || []);
      
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      toast({
        title: "Erro ao carregar vagas",
        description: error instanceof Error ? error.message : "Não foi possível carregar as vagas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = () => {
    navigate("/vagas/nova");
  };

  const handleJobClick = (jobId: string, jobStatus?: string) => {
    navigate(`/vagas/${jobId}`, { state: { status: jobStatus } });
  };

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vagas</h1>
          <p className="text-muted-foreground">Gerencie suas vagas publicadas no LinkedIn</p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Vaga
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar vagas..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada ainda"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateJob}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Vaga
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full"
            onClick={() => handleJobClick(job.id, job.status)}
          >
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant={statusConfig[job.status].variant} className="shrink-0">
                  {statusConfig[job.status].label}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2 mb-2">{job.jobTitle}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Modalidade</span>
                  <span className="font-medium">
                    {job.workplace === 'REMOTE' ? 'Remoto' : 
                     job.workplace === 'HYBRID' ? 'Híbrido' : 
                     job.workplace === 'ON_SITE' ? 'Presencial' : job.workplace}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Publicada em</span>
                  <span className="font-medium">
                    {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {job.linkedinUrl && (
                  <a 
                    href={job.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver no LinkedIn →
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}

