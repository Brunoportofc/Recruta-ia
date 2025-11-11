import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users, Globe, Briefcase, Mail, Phone, FileText, Pencil, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dados da empresa (do contexto de autenticação)
  const [companyData, setCompanyData] = useState({
    nome: '',
    email: '',
    cnpj: '',
    telefone: '',
    ramoAtuacao: '',
    tamanhoEmpresa: '',
    website: '',
    localizacao: '',
    descricao: ''
  });

  // Atualizar dados quando o user mudar
  useEffect(() => {
    if (user) {
      setCompanyData({
        nome: user.nome || '',
        email: user.email || '',
        cnpj: user.cnpj || '',
        telefone: user.telefone || '',
        ramoAtuacao: user.ramoAtuacao || '',
        tamanhoEmpresa: user.tamanhoEmpresa || '',
        website: user.website || '',
        localizacao: user.localizacao || '',
        descricao: user.descricao || ''
      });
    }
  }, [user]);

  const handleSaveCompanyData = async () => {
    try {
      setIsSaving(true);
      
      toast({
        title: "💾 Salvando alterações...",
        description: "Aguarde enquanto atualizamos seus dados",
      });

      const response = await fetch(`http://localhost:3001/empresa/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nome: companyData.nome,
          email: companyData.email,
          cnpj: companyData.cnpj,
          telefone: companyData.telefone,
          ramoAtuacao: companyData.ramoAtuacao,
          tamanhoEmpresa: companyData.tamanhoEmpresa,
          website: companyData.website,
          localizacao: companyData.localizacao,
          descricao: companyData.descricao
        })
      });

      const data = await response.json();

      if (data.success && data.empresa) {
        // Atualizar contexto global com os novos dados
        updateUser(data.empresa);
        
        toast({
          title: "✅ Dados salvos com sucesso!",
          description: "Suas informações foram atualizadas",
        });

        // Sair do modo de edição
        setIsEditing(false);
      } else {
        throw new Error(data.error || 'Erro ao atualizar dados');
      }

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar seus dados",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaurar dados originais do user
    if (user) {
      setCompanyData({
        nome: user.nome || '',
        email: user.email || '',
        cnpj: user.cnpj || '',
        telefone: user.telefone || '',
        ramoAtuacao: user.ramoAtuacao || '',
        tamanhoEmpresa: user.tamanhoEmpresa || '',
        website: user.website || '',
        localizacao: user.localizacao || '',
        descricao: user.descricao || ''
      });
    }
    setIsEditing(false);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return value;
  };

  const getRamoLabel = (ramo: string) => {
    const ramos: Record<string, string> = {
      'tecnologia': 'Tecnologia',
      'financeiro': 'Financeiro',
      'saude': 'Saúde',
      'educacao': 'Educação',
      'varejo': 'Varejo',
      'industria': 'Indústria',
      'servicos': 'Serviços',
      'agronegocio': 'Agronegócio',
      'construcao': 'Construção Civil',
      'outros': 'Outros'
    };
    return ramos[ramo] || ramo;
  };

  const getTamanhoLabel = (tamanho: string) => {
    const tamanhos: Record<string, string> = {
      '1-10': '1-10 funcionários',
      '11-50': '11-50 funcionários',
      '51-200': '51-200 funcionários',
      '201-500': '201-500 funcionários',
      '501+': 'Mais de 500 funcionários'
    };
    return tamanhos[tamanho] || tamanho;
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Carregando dados da empresa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua empresa
        </p>
      </div>

      <Separator />

      {/* Perfil da Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Perfil da Empresa</CardTitle>
              <CardDescription>
                Informações principais sobre sua organização
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header com nome da empresa */}
          <div className="rounded-lg border bg-muted/50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {companyData.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{companyData.nome}</h2>
                <p className="text-sm text-muted-foreground">{companyData.email}</p>
                {companyData.descricao && (
                  <p className="mt-2 text-sm">{companyData.descricao}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações em cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Ramo de Atuação */}
            {companyData.ramoAtuacao && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Ramo de Atuação</p>
                    <p className="font-medium">{getRamoLabel(companyData.ramoAtuacao)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tamanho */}
            {companyData.tamanhoEmpresa && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Tamanho</p>
                    <p className="font-medium">{getTamanhoLabel(companyData.tamanhoEmpresa)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Localização */}
            {companyData.localizacao && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium">{companyData.localizacao}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Telefone */}
            {companyData.telefone && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{formatTelefone(companyData.telefone)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Website */}
            {companyData.website && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a 
                      href={companyData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {companyData.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CNPJ */}
            {companyData.cnpj && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{formatCNPJ(companyData.cnpj)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editar Informações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editar Informações</CardTitle>
              <CardDescription>
                Atualize os dados da sua empresa
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa</Label>
              <Input
                id="nome"
                value={companyData.nome}
                onChange={(e) => setCompanyData({ ...companyData, nome: e.target.value })}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formatTelefone(companyData.telefone)}
                onChange={(e) => setCompanyData({ ...companyData, telefone: e.target.value.replace(/\D/g, '') })}
                disabled={!isEditing || isSaving}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formatCNPJ(companyData.cnpj)}
                onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value.replace(/\D/g, '') })}
                disabled={!isEditing || isSaving}
                maxLength={18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={companyData.localizacao}
                onChange={(e) => setCompanyData({ ...companyData, localizacao: e.target.value })}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={companyData.descricao}
                onChange={(e) => setCompanyData({ ...companyData, descricao: e.target.value })}
                disabled={!isEditing || isSaving}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <Button 
                onClick={handleSaveCompanyData} 
                disabled={isSaving}
                size="lg"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button 
                onClick={handleCancelEdit} 
                disabled={isSaving}
                variant="outline"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes do seu cadastro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email de login:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          {user.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Conta criada em:</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
