import { FileText, Send, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TestCandidate {
  id: string;
  name: string;
  jobTitle: string;
  score: number;
  testStatus: "not_sent" | "sent" | "completed";
  sentDate?: string;
}

const mockCandidates: TestCandidate[] = [
  {
    id: "1",
    name: "João Silva",
    jobTitle: "Desenvolvedor Full Stack Senior",
    score: 92,
    testStatus: "completed",
    sentDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    jobTitle: "Designer UX/UI Pleno",
    score: 88,
    testStatus: "sent",
    sentDate: "2024-01-16",
  },
  {
    id: "3",
    name: "Ana Costa",
    jobTitle: "Gerente de Produtos",
    score: 95,
    testStatus: "not_sent",
  },
];

const testStatusConfig = {
  not_sent: { 
    label: "Teste não enviado", 
    variant: "outline" as const, 
    icon: FileText 
  },
  sent: { 
    label: "Aguardando resposta", 
    variant: "secondary" as const, 
    icon: Clock 
  },
  completed: { 
    label: "Teste concluído", 
    variant: "default" as const, 
    icon: CheckCircle 
  },
};

export default function Tests() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testes Psicológicos</h1>
        <p className="text-muted-foreground">Envie e gerencie testes para candidatos qualificados</p>
      </div>

      <div className="grid gap-4">
        {mockCandidates.map((candidate) => {
          const StatusIcon = testStatusConfig[candidate.testStatus].icon;
          
          return (
            <Card key={candidate.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{candidate.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{candidate.jobTitle}</p>
                  </div>
                  <Badge variant={testStatusConfig[candidate.testStatus].variant}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {testStatusConfig[candidate.testStatus].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pontuação IA</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{candidate.score}</span>
                    </div>
                  </div>
                  {candidate.sentDate && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data de Envio</p>
                      <p className="text-sm font-medium">
                        {new Date(candidate.sentDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {candidate.testStatus === "not_sent" && (
                    <Button size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Teste
                    </Button>
                  )}
                  {candidate.testStatus === "sent" && (
                    <Button size="sm" variant="outline">
                      Reenviar Teste
                    </Button>
                  )}
                  {candidate.testStatus === "completed" && (
                    <Button size="sm">Visualizar Resultados</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
