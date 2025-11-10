import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithLinkedIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando LinkedIn...');
  
  useEffect(() => {
    const processCallback = async () => {
      // Verificar se há erro na URL
      const error = searchParams.get('error');
      const empresaId = searchParams.get('empresaId');
      
      if (error) {
        console.error('❌ [CALLBACK] Erro recebido:', error);
        setStatus('error');
        setMessage('Falha ao conectar com o LinkedIn. Por favor, tente novamente.');
        return;
      }
      
      console.log('🔵 [CALLBACK] Processando callback da Unipile...');
      console.log('🔵 [CALLBACK] Empresa ID:', empresaId);
      setMessage('Por favor, clique em "Close" na tela da Unipile para finalizar...');
      
      // Função para tentar buscar os dados (com retry)
      const tryFetchWithRetry = async (maxAttempts = 20, delayMs = 3000) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            console.log(`🔄 [CALLBACK] Tentativa ${attempt}/${maxAttempts}...`);
            setMessage(`Aguardando finalização... (Tentativa ${attempt}/${maxAttempts})`);
            
            const response = await fetch(
              `http://localhost:3001/empresa/linkedin/callback?empresaId=${empresaId || 'temp-empresa-id'}`
            );
            
            const data = await response.json();
            
            // Se conseguiu conectar com sucesso
            if (data.success && data.empresa && data.empresa.unipileConnected) {
              console.log('✅ [CALLBACK] LinkedIn conectado com sucesso!');
              console.log('👤 [CALLBACK] Dados da empresa:', data.empresa);
              
              // Fazer login automático com os dados da empresa
              loginWithLinkedIn(data.empresa);
              
              setStatus('success');
              setMessage('LinkedIn conectado! Entrando no sistema...');
              
              // Redirecionar para o dashboard após 1 segundo
              setTimeout(() => {
                navigate('/');
              }, 1000);
              
              return true; // Sucesso
            }
            
            // Se a conta existe mas ainda não está conectada, continuar tentando
            if (data.success && data.empresa && !data.empresa.unipileConnected) {
              console.log(`⏳ [CALLBACK] Conta ainda não conectada, tentando novamente em ${delayMs/1000}s...`);
              
              // Aguardar antes da próxima tentativa
              if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
              }
              continue;
            }
            
            // Se deu erro mas não é crítico, tentar novamente
            console.warn('⚠️  [CALLBACK] Resposta inesperada, tentando novamente...');
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            
          } catch (error) {
            console.error(`❌ [CALLBACK] Erro na tentativa ${attempt}:`, error);
            
            // Se não é a última tentativa, continuar
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            }
            
            // Se é a última tentativa, mostrar erro
            throw error;
          }
        }
        
        // Se chegou aqui, esgotou as tentativas
        throw new Error('Tempo limite excedido. Por favor, tente conectar novamente.');
      };
      
      try {
        await tryFetchWithRetry(20, 3000); // 20 tentativas x 3 segundos = até 60 segundos
      } catch (error) {
        console.error('❌ [CALLBACK] Erro ao processar:', error);
        setStatus('error');
        setMessage(
          error instanceof Error 
            ? error.message 
            : 'Não foi possível conectar com LinkedIn. Tente novamente.'
        );
      }
    };
    
    processCallback();
  }, [searchParams, navigate, loginWithLinkedIn]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Finalizando conexão...</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    ⚠️ Ação necessária:
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Por favor, clique no botão <strong>"Close"</strong> na janela da Unipile para continuar.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  O sistema verificará automaticamente quando você clicar em "Close"
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Sucesso!
                </h2>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecionando para o dashboard...
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Erro ao conectar
                </h2>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                <Button onClick={() => navigate('/login')} className="mt-4">
                  Voltar para Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

