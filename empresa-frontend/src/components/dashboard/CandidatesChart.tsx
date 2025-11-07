import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Dev Full Stack", candidates: 24 },
  { name: "UX/UI Designer", candidates: 18 },
  { name: "Gerente de Produtos", candidates: 12 },
  { name: "Analista de Dados", candidates: 45 },
  { name: "Engenheiro DevOps", candidates: 15 },
];

export function CandidatesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidatos por Vaga</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="candidates" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
