import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando sua conta LinkedIn...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const connectToken = searchParams.get('connect_token');
      const error = searchParams.get('error');

      // Se houve erro na autorização
      if (error) {
        throw new Error(`Erro na autorização: ${error}`);
      }

      // Verifica se recebeu os parâmetros necessários
      if (!code || !connectToken) {
        throw new Error('Código de autorização ou token não encontrado');
      }

      console.log('📥 [CALLBACK] Recebendo callback do LinkedIn');
      console.log('🔑 [CALLBACK] Code:', code.substring(0, 10) + '...');
      console.log('🎫 [CALLBACK] Connect Token:', connectToken.substring(0, 10) + '...');

      // Envia para o backend finalizar a conexão
      const response = await fetch(
        `http://localhost:3001/empresa/linkedin/callback?code=${encodeURIComponent(code)}&connect_token=${encodeURIComponent(connectToken)}`
      );

      const data = await response.json();

      if (data.success) {
        console.log('✅ [CALLBACK] LinkedIn conectado com sucesso!');
        setStatus('success');
        setMessage('LinkedIn conectado com sucesso!');
        
        toast({
          title: "✅ LinkedIn Conectado!",
          description: "Bem-vindo! Você já pode publicar vagas no LinkedIn.",
        });

        // Aguarda 2 segundos antes de redirecionar para o dashboard
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(data.error || data.details || 'Erro ao conectar LinkedIn');
      }
    } catch (error) {
      console.error('❌ [CALLBACK] Erro:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Falha ao conectar LinkedIn');
      
      toast({
        title: "❌ Erro ao conectar",
        description: error instanceof Error ? error.message : "Falha ao conectar LinkedIn. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">{message}</h2>
                <p className="text-sm text-muted-foreground">
                  Por favor, aguarde enquanto verificamos sua autorização...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  {message}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para as configurações...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
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

