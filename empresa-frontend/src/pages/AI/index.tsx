import { Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Analysis {
  id: string;
  candidateName: string;
  jobTitle: string;
  score: number;
  skills: string[];
  status: "completed" | "processing";
}

const mockAnalyses: Analysis[] = [
  {
    id: "1",
    candidateName: "João Silva",
    jobTitle: "Desenvolvedor Full Stack Senior",
    score: 92,
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    status: "completed",
  },
  {
    id: "2",
    candidateName: "Maria Santos",
    jobTitle: "Designer UX/UI Pleno",
    score: 88,
    skills: ["Figma", "Design System", "Prototipação", "User Research"],
    status: "completed",
  },
  {
    id: "3",
    candidateName: "Pedro Oliveira",
    jobTitle: "Desenvolvedor Full Stack Senior",
    score: 85,
    skills: ["React", "Python", "PostgreSQL", "API Rest"],
    status: "processing",
  },
];

export default function AIAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IA / Ranqueamento</h1>
          <p className="text-muted-foreground">Análise inteligente de currículos e competências</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">IA Ativa</span>
        </div>
      </div>

      <div className="grid gap-4">
        {mockAnalyses.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{analysis.candidateName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{analysis.jobTitle}</p>
                </div>
                <Badge variant={analysis.status === "completed" ? "default" : "outline"}>
                  {analysis.status === "completed" ? "Concluído" : "Processando"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pontuação:</span>
                  <span className="text-2xl font-bold text-primary">{analysis.score}</span>
                </div>
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Competências Identificadas:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm">Visualizar Detalhes</Button>
                <Button size="sm" variant="outline">
                  Reprocessar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

