import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e integrações</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Recrutador</CardTitle>
            <CardDescription>Informações pessoais e profissionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" defaultValue="Maria Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" defaultValue="Gerente de Recrutamento" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" defaultValue="maria.silva@empresa.com.br" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Informações da organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da empresa</Label>
                <Input id="company" defaultValue="Tech Solutions Ltda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="12.345.678/0001-90" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plano atual</Label>
              <div className="flex items-center gap-2">
                <Input id="plan" defaultValue="Profissional" disabled />
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
            <Button>Atualizar Informações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração LinkedIn</CardTitle>
            <CardDescription>Conecte sua conta para publicar vagas automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Linkedin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">LinkedIn via Unipile</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <p className="text-sm text-muted-foreground">Conectado</p>
                  </div>
                </div>
              </div>
              <Button variant="outline">Desconectar</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Permissões concedidas:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Publicar vagas no LinkedIn</li>
                <li>• Acessar candidaturas recebidas</li>
                <li>• Gerenciar processos seletivos</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              Atualizar Integração
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
