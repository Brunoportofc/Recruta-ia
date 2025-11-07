import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Candidate {
  id: string;
  name: string;
  email: string;
  date: string;
  status: "analyzing" | "test_sent" | "approved" | "rejected";
  score: number;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    date: "2024-01-15",
    status: "approved",
    score: 92,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    date: "2024-01-14",
    status: "test_sent",
    score: 88,
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    date: "2024-01-13",
    status: "analyzing",
    score: 85,
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    date: "2024-01-12",
    status: "approved",
    score: 95,
  },
];

const statusConfig = {
  analyzing: { label: "Em Análise", variant: "outline" as const },
  test_sent: { label: "Teste Enviado", variant: "secondary" as const },
  approved: { label: "Aprovado", variant: "default" as const },
  rejected: { label: "Reprovado", variant: "destructive" as const },
};

export default function CandidatesList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidaturas</h1>
        <p className="text-muted-foreground">Gerencie os candidatos e suas pontuações</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar candidatos..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data de Envio</TableHead>
              <TableHead>Pontuação IA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCandidates.map((candidate) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

