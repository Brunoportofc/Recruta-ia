import { Search, Filter, ChevronLeft, Users, Loader2 } from "lucide-react";
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

interface Candidato {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  linkedinUrl?: string;
  fotoPerfilUrl?: string;
}

interface Candidatura {
  id: string;
  candidatoId: string;
  vagaId: string;
  status: string;
  dataCandidatura: string;
  curriculoSnapshot: any;
  testeResultado: any;
  candidato: Candidato;
}

interface Vaga {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  aguardando_testes: { label: "Aguardando Testes", variant: "secondary" },
  analise_completa: { label: "Análise Completa", variant: "default" },
  aprovado: { label: "Aprovado", variant: "default" },
  reprovado: { label: "Reprovado", variant: "destructive" },
};

export default function CandidatesList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const vagaId = searchParams.get("vaga");

  // Busca vaga e candidaturas
  useEffect(() => {
    const carregarDados = async () => {
      if (!vagaId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('📋 [CANDIDATURAS] Buscando dados da vaga:', vagaId);

        // Busca dados da vaga
        const vagaResponse = await fetch(`http://localhost:3001/jobs/${vagaId}`);
        if (vagaResponse.ok) {
          const vagaData = await vagaResponse.json();
          setVaga({
            id: vagaData.id,
            jobTitle: vagaData.jobTitle,
            company: vagaData.company,
            location: vagaData.location,
            status: vagaData.status
          });
          console.log('✅ [CANDIDATURAS] Vaga carregada:', vagaData.jobTitle);
        }

        // Busca candidaturas da vaga
        const candidaturasResponse = await fetch(`http://localhost:3001/candidatura/vaga/${vagaId}`);
        if (candidaturasResponse.ok) {
          const data = await candidaturasResponse.json();
          console.log('✅ [CANDIDATURAS] Candidaturas carregadas:', data.data.length);
          setCandidaturas(data.data || []);
        } else {
          console.log('⚠️  [CANDIDATURAS] Nenhuma candidatura encontrada');
          setCandidaturas([]);
        }
      } catch (error) {
        console.error('❌ [CANDIDATURAS] Erro ao carregar dados:', error);
        setCandidaturas([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [vagaId]);

  // Filtragem por termo de busca
  const filteredCandidaturas = candidaturas.filter(candidatura =>
    candidatura.candidato.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidatura.candidato.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPages = Math.ceil(filteredCandidaturas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCandidaturas = filteredCandidaturas.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vagaId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma vaga selecionada</CardTitle>
            <CardDescription>
              Por favor, selecione uma vaga para ver as candidaturas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/vagas")}>
              Voltar para vagas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/vagas")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Candidaturas</h1>
          {vaga && (
            <p className="text-muted-foreground mt-1">
              {vaga.jobTitle} • {vaga.company}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          {candidaturas.length} candidato{candidaturas.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset para primeira página ao buscar
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      {currentCandidaturas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? "Nenhum candidato encontrado" : "Nenhuma candidatura ainda"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm 
                ? "Tente buscar com outros termos" 
                : "Compartilhe o link da vaga para receber candidaturas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCandidaturas.map((candidatura) => (
                  <TableRow key={candidatura.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {candidatura.candidato.fotoPerfilUrl ? (
                          <img
                            src={candidatura.candidato.fotoPerfilUrl}
                            alt={candidatura.candidato.nomeCompleto}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {candidatura.candidato.nomeCompleto.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{candidatura.candidato.nomeCompleto}</p>
                          {candidatura.candidato.telefone && (
                            <p className="text-xs text-muted-foreground">
                              {candidatura.candidato.telefone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidatura.candidato.email}</TableCell>
                    <TableCell>
                      {candidatura.candidato.cidade && candidatura.candidato.estado
                        ? `${candidatura.candidato.cidade}, ${candidatura.candidato.estado}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[candidatura.status]?.variant || "outline"}>
                        {statusConfig[candidatura.status]?.label || candidatura.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/candidatos/${candidatura.id}/curriculo`)}
                        >
                          Currículo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/candidatos/${candidatura.id}/testes`)}
                        >
                          Testes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCandidaturas.length)} de{" "}
                {filteredCandidaturas.length} candidatos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostra primeira, última, atual e adjacentes
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      // Adiciona "..." entre números não consecutivos
                      const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <>
                          {showEllipsis && (
                            <span key={`ellipsis-${page}`} className="px-2">
                              ...
                            </span>
                          )}
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        </>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
