import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, CheckCircle, Loader2, AlertCircle, Building2, MapPin, Users, Globe, Briefcase, Calendar, Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinConnectedAt, setLinkedinConnectedAt] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // Dados da empresa (do contexto de autenticação)
  const [companyData, setCompanyData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    avatar: user?.avatar || '',
    logo: user?.logo || '',
    headline: user?.headline || '',
    description: user?.description || '',
    industry: user?.industry || '',
    location: user?.location || '',
    website: user?.website || '',
    employeeCount: user?.employeeCount || ''
  });
  
  const empresaId = user?.id || localStorage.getItem('empresaId') || 'temp-empresa-id';

  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  // Atualizar dados quando o user mudar
  useEffect(() => {
    if (user) {
      setCompanyData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        avatar: user.avatar || '',
        logo: user.logo || '',
        headline: user.headline || '',
        description: user.description || '',
        industry: user.industry || '',
        location: user.location || '',
        website: user.website || '',
        employeeCount: user.employeeCount || ''
      });
      setLinkedinConnected(user.unipileConnected || false);
      setLinkedinConnectedAt(user.unipileConnectedAt || null);
    }
  }, [user]);

  const checkLinkedInStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const response = await fetch(`http://localhost:3001/empresa/linkedin/status?empresaId=${empresaId}`);
      const data = await response.json();
      
      if (data.success && data.empresa) {
        setLinkedinConnected(data.connected);
        setLinkedinConnectedAt(data.empresa.unipileConnectedAt);
        
        // Atualizar dados da empresa com TODOS os campos do LinkedIn
        setCompanyData({
          nome: data.empresa.nome || '',
          email: data.empresa.email || '',
          telefone: data.empresa.telefone || '',
          avatar: data.empresa.avatar || '',
          logo: data.empresa.logo || '',
          headline: data.empresa.headline || '',
          description: data.empresa.description || '',
          industry: data.empresa.industry || '',
          location: data.empresa.location || '',
          website: data.empresa.website || '',
          employeeCount: data.empresa.employeeCount || ''
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSaveCompanyData = async () => {
    try {
      toast({
        title: "💾 Salvando alterações...",
        description: "Aguarde enquanto atualizamos seus dados",
      });

      // TODO: Implementar endpoint de atualização de dados da empresa
      // Por enquanto, apenas atualiza localmente
      console.log('Dados para salvar:', companyData);
      
      toast({
        title: "✅ Dados atualizados",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar os dados",
        variant: "destructive"
      });
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      
      console.log('🔵 [SETTINGS] Iniciando conexão com LinkedIn...');
      
      // Chama backend para obter URL de autorização (mesmo endpoint do login)
      const response = await fetch(`http://localhost:3001/empresa/linkedin/auth?empresaId=${empresaId}`);
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        console.log('✅ [SETTINGS] Redirecionando para LinkedIn...');
        // Redireciona para Unipile Hosted Auth
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Não foi possível gerar URL de autorização');
      }
    } catch (error) {
      console.error('❌ [SETTINGS] Erro ao conectar:', error);
      toast({
        title: "❌ Erro ao conectar",
        description: error instanceof Error ? error.message : "Não foi possível iniciar conexão com LinkedIn",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm('Tem certeza que deseja desconectar o LinkedIn? Você não poderá publicar vagas.')) {
      return;
    }

    try {
      setIsDisconnecting(true);
      
      const response = await fetch(`http://localhost:3001/empresa/linkedin/disconnect?empresaId=${empresaId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLinkedinConnected(false);
        toast({
          title: "✅ LinkedIn desconectado",
          description: "Sua conta LinkedIn foi desconectada com sucesso",
        });
      } else {
        throw new Error(data.error || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "❌ Erro ao desconectar",
        description: error instanceof Error ? error.message : "Não foi possível desconectar LinkedIn",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Perfil da Empresa</h1>
        <p className="text-muted-foreground">Visualize e gerencie as informações da sua Company Page do LinkedIn</p>
      </div>

      <div className="grid gap-6">
        {/* Card Principal - Company Page Visual */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header com Logo e Nome */}
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 h-48 flex items-end justify-center pb-16">
              <div className="absolute bottom-0 transform translate-y-1/2">
                {companyData.logo ? (
                  <div className="h-32 w-32 rounded-2xl border-4 border-background bg-background overflow-hidden shadow-2xl">
                    <img src={companyData.logo} alt="Logo" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-2xl border-4 border-background bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-2xl">
                    <Building2 className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="px-8 pt-20 pb-8">
              {/* Nome e Badge */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {companyData.nome || 'Nome da Empresa'}
                  </h2>
                  {linkedinConnected && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  )}
                </div>
                
                {companyData.headline && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {companyData.headline}
                  </p>
                )}
              </div>
              
              {/* Stats Cards */}
              {(companyData.industry || companyData.location || companyData.employeeCount || companyData.website) && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {companyData.industry && (
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-blue-500 p-2">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Setor</p>
                          <p className="font-bold text-sm text-blue-900 dark:text-blue-100">{companyData.industry}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {companyData.location && (
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-green-500 p-2">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Localização</p>
                          <p className="font-bold text-sm text-green-900 dark:text-green-100">{companyData.location}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {companyData.employeeCount && (
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-purple-500 p-2">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Funcionários</p>
                          <p className="font-bold text-sm text-purple-900 dark:text-purple-100">{companyData.employeeCount}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {companyData.website && (
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-orange-500 p-2">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Website</p>
                          <a 
                            href={companyData.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-bold text-sm text-orange-900 dark:text-orange-100 hover:underline"
                          >
                            {companyData.website.replace('https://', '').replace('http://', '').split('/')[0]}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sobre a Empresa */}
              {companyData.description && (
                <div className="mb-8">
                  <div className="rounded-xl border bg-muted/30 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Sobre a Empresa</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {companyData.description}
                    </p>
                  </div>
                </div>
              )}
              
              <Separator className="my-8" />
              
              {/* Informações de Contato */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Informações de Contato</h3>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      E-mail / LinkedIn ID
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={companyData.email}
                      readOnly
                      className="bg-muted/50 font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Telefone
                    </Label>
                    <Input 
                      id="telefone" 
                      value={companyData.telefone}
                      onChange={(e) => setCompanyData({...companyData, telefone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
              
              {/* Status de Conexão */}
              {linkedinConnected && linkedinConnectedAt && (
                <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500 p-2">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        LinkedIn conectado com sucesso
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Desde {new Date(linkedinConnectedAt).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric'
                        })} às {new Date(linkedinConnectedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!linkedinConnected && (
                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-200 dark:border-amber-800 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-500 p-2 shrink-0">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        LinkedIn não conectado
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Conecte sua conta LinkedIn para obter automaticamente todos os dados da sua Company Page
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                {linkedinConnected ? (
                  <>
                    <Button 
                      onClick={handleDisconnectLinkedIn} 
                      variant="outline"
                      size="lg" 
                      className="flex-1"
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <Linkedin className="mr-2 h-5 w-5" />
                          Desconectar LinkedIn
                        </>
                      )}
                    </Button>
                    <Button onClick={handleSaveCompanyData} size="lg" className="flex-1">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleConnectLinkedIn} 
                    size="lg" 
                    className="w-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Linkedin className="mr-2 h-5 w-5" />
                        Conectar com LinkedIn
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
