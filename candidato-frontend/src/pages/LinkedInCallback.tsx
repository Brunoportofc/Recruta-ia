import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const hasProcessed = useRef(false); // Flag para evitar processamento duplo

  useEffect(() => {
    // Evita processamento duplo (React StrictMode chama useEffect 2x)
    if (hasProcessed.current) {
      console.log('⚠️ Callback já foi processado, ignorando...');
      return;
    }
    
    hasProcessed.current = true;
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('🔵 [CALLBACK] Iniciando processamento no frontend...');

      // Verifica se houve erro na autorização
      if (errorParam) {
        console.log('❌ [CALLBACK] Erro do LinkedIn:', errorParam);
        setError(errorDescription || 'Erro ao autorizar com LinkedIn');
        setIsProcessing(false);
        return;
      }

      // Verifica se o código foi fornecido
      if (!code || !state) {
        console.log('❌ [CALLBACK] Parâmetros inválidos');
        setError('Parâmetros de autenticação inválidos');
        setIsProcessing(false);
        return;
      }

      console.log('✅ [CALLBACK] Code e State recebidos');

      // Processa o callback
      console.log('🔵 [CALLBACK] Chamando backend...');
      const result = await authService.handleLinkedInCallback(code, state);
      console.log('✅ [CALLBACK] Backend respondeu com sucesso');

      // Atualiza o contexto de autenticação
      console.log('🔵 [CALLBACK] Atualizando AuthContext...');
      refreshUser();
      console.log('✅ [CALLBACK] AuthContext atualizado');

      // Mostra mensagem de sucesso
      setSuccess(true);
      setIsProcessing(false);

      // Redireciona para o formulário
      console.log('🔵 [CALLBACK] Redirecionando para formulário...');
      setTimeout(() => {
        navigate('/formulario-curriculo', { replace: true });
      }, 800);
    } catch (err) {
      console.error('❌ [CALLBACK] Erro ao processar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar autenticação');
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isProcessing ? 'Processando...' : success ? 'Sucesso!' : 'Erro na Autenticação'}
          </CardTitle>
          <CardDescription className="text-center">
            {isProcessing 
              ? 'Estamos completando sua autenticação com LinkedIn'
              : success
              ? 'Autenticação concluída com sucesso!'
              : 'Ocorreu um problema durante a autenticação'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Aguarde enquanto obtemos seus dados do LinkedIn...
              </p>
            </>
          ) : success ? (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Redirecionando para o formulário...
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleRetry}
                  className="text-sm text-primary hover:underline"
                >
                  Voltar para o login
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

