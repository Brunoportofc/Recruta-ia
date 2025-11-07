import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, Loader2, Briefcase } from 'lucide-react';

export default function Login() {
  const { loginWithLinkedIn, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleLinkedInLogin = async () => {
    setError('');
    
    try {
      await loginWithLinkedIn();
      // O loginWithLinkedIn redireciona para o LinkedIn automaticamente
    } catch (err) {
      setError('Erro ao conectar com LinkedIn. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Recruta.ai
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua próxima oportunidade está aqui
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription className="text-base">
              Entre com sua conta do LinkedIn para começar
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Botão LinkedIn */}
            <Button
              variant="linkedin"
              size="lg"
              className="w-full h-12 text-base"
              onClick={handleLinkedInLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <Linkedin className="h-5 w-5 mr-2" />
                  Continuar com LinkedIn
                </>
              )}
            </Button>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
}

