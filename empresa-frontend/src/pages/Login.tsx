import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithLinkedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Obter ou criar empresaId do localStorage
  const getEmpresaId = () => {
    let empresaId = localStorage.getItem('empresaId');
    if (!empresaId) {
      // Gerar um novo UUID se não existir
      empresaId = crypto.randomUUID();
      localStorage.setItem('empresaId', empresaId);
      console.log('🆕 [LOGIN] Novo empresaId gerado:', empresaId);
    } else {
      console.log('♻️  [LOGIN] EmpresaId existente:', empresaId);
    }
    return empresaId;
  };
  
  const empresaId = getEmpresaId();
  
  console.log('🔑 [LOGIN] EmpresaId em uso:', empresaId);

  const handleConnectLinkedIn = async () => {
    try {
      setIsCheckingConnection(true);
      
      console.log('🔵 [LOGIN] Botão "Conectar com LinkedIn" clicado');
      console.log('🔍 [LOGIN] Verificando se já existe conexão...');
      console.log('🆔 [LOGIN] EmpresaId:', empresaId);
      
      // Primeiro, verificar se já existe uma conexão
      const statusResponse = await fetch(
        `http://localhost:3001/empresa/linkedin/status?empresaId=${empresaId}`
      );
      
      const statusData = await statusResponse.json();
      
      console.log('📦 [LOGIN] Resposta do status:', statusData);
      
      // Se já estiver conectado, fazer login automático
      if (statusData.success && statusData.connected && statusData.empresa) {
        console.log('✅ [LOGIN] Conexão existente encontrada!');
        console.log('👤 [LOGIN] Dados da empresa:', statusData.empresa);
        
        toast({
          title: "✅ LinkedIn já conectado",
          description: "Entrando no sistema...",
        });
        
        // Fazer login automático
        loginWithLinkedIn(statusData.empresa);
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate('/');
        }, 1000);
        
        return; // Não prosseguir com nova conexão
      }
      
      // Se NÃO estiver conectado, iniciar fluxo de conexão
      console.log('⚠️  [LOGIN] Nenhuma conexão encontrada, iniciando novo fluxo...');
      
      setIsCheckingConnection(false);
      setIsConnectingLinkedIn(true);
      
      console.log('🔵 [LOGIN] Gerando URL de autenticação...');
      
      // Chama backend para obter URL de autorização da Unipile Hosted Auth
      const authResponse = await fetch(`http://localhost:3001/empresa/linkedin/auth?empresaId=${empresaId}`);
      const authData = await authResponse.json();
      
      if (authData.success && authData.authUrl) {
        console.log('✅ [LOGIN] Redirecionando para Unipile Hosted Auth...');
        // Redireciona para Unipile Hosted Auth
        window.location.href = authData.authUrl;
      } else {
        throw new Error(authData.error || 'Não foi possível gerar URL de autorização');
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erro ao conectar:', error);
      toast({
        title: "❌ Erro ao conectar",
        description: error instanceof Error ? error.message : "Não foi possível conectar com LinkedIn",
        variant: "destructive"
      });
      setIsConnectingLinkedIn(false);
      setIsCheckingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Email ou senha inválidos");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">F</span>
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao FACTORIA</CardTitle>
          <CardDescription>
            Sistema inteligente de triagem e ranqueamento de currículos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg" 
            onClick={handleConnectLinkedIn}
            disabled={isConnectingLinkedIn || isLoading || isCheckingConnection}
          >
            {isCheckingConnection ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificando conexão...
              </>
            ) : isConnectingLinkedIn ? (
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continue com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isCheckingConnection}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isCheckingConnection}
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={isLoading || isCheckingConnection}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0 h-auto font-normal" disabled>
              Cadastre-se
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
