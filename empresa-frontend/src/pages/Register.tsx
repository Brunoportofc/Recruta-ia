import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Dados da empresa
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ramoAtuacao, setRamoAtuacao] = useState("");
  const [tamanhoEmpresa, setTamanhoEmpresa] = useState("");
  const [website, setWebsite] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [descricao, setDescricao] = useState("");

  // Dados de acesso
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Formatação de CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cnpj;
  };

  // Formatação de telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return telefone;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpar erros anteriores
    
    // Validações
    if (password !== confirmPassword) {
      const errorMsg = "As senhas digitadas não são iguais";
      setError(errorMsg);
      toast({
        title: "❌ Senhas não conferem",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      const errorMsg = "A senha deve ter no mínimo 6 caracteres";
      setError(errorMsg);
      toast({
        title: "❌ Senha muito curta",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implementar chamada para o backend
      const response = await fetch('http://localhost:3001/empresa/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeEmpresa,
          cnpj: cnpj.replace(/\D/g, ''), // Remove formatação
          telefone: telefone.replace(/\D/g, ''), // Remove formatação
          ramoAtuacao,
          tamanhoEmpresa,
          website,
          localizacao,
          descricao,
          email,
          senha: password
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Cadastro realizado com sucesso!",
          description: "Você já pode fazer login com suas credenciais",
        });

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.error || 'Erro ao cadastrar empresa');
      }

    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível completar o cadastro";
      setError(errorMessage);
      
      toast({
        title: "❌ Erro ao cadastrar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-fit -ml-2"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para login
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Cadastre sua empresa</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para começar a usar o sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mensagem de Erro */}
            {error && (
              <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/30">
                <div className="font-semibold mb-1">Erro ao cadastrar</div>
                <div>{error}</div>
              </div>
            )}
            
            {/* Seção: Dados da Empresa */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dados da Empresa</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nomeEmpresa">
                    Nome da Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nomeEmpresa"
                    placeholder="Ex: Factoria Tecnologia"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={handleCNPJChange}
                    maxLength={18}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    maxLength={15}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ramoAtuacao">
                    Ramo de Atuação <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={ramoAtuacao} 
                    onValueChange={setRamoAtuacao}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger id="ramoAtuacao">
                      <SelectValue placeholder="Selecione o ramo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="varejo">Varejo</SelectItem>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="agronegocio">Agronegócio</SelectItem>
                      <SelectItem value="construcao">Construção Civil</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanhoEmpresa">
                    Tamanho da Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={tamanhoEmpresa} 
                    onValueChange={setTamanhoEmpresa}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger id="tamanhoEmpresa">
                      <SelectValue placeholder="Nº de funcionários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 funcionários</SelectItem>
                      <SelectItem value="11-50">11-50 funcionários</SelectItem>
                      <SelectItem value="51-200">51-200 funcionários</SelectItem>
                      <SelectItem value="201-500">201-500 funcionários</SelectItem>
                      <SelectItem value="501+">Mais de 500 funcionários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.suaempresa.com.br"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localizacao">
                    Localização <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="localizacao"
                    placeholder="Ex: São Paulo, SP"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição da Empresa</Label>
                  <textarea
                    id="descricao"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Conte um pouco sobre sua empresa..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Dados de Acesso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <span className="text-lg">🔐</span>
                <h3 className="text-lg font-semibold">Dados de Acesso</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">
                    E-mail <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use este e-mail para acessar sua conta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar Senha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-primary"
                  onClick={() => navigate('/login')}
                  type="button"
                  disabled={isLoading}
                >
                  Faça login
                </Button>
              </div>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

