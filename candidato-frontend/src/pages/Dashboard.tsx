import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Briefcase, User, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">Recruta.ai</h1>
              <span className="text-sm text-muted-foreground">Área do Candidato</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bem-vindo(a), {user?.name}! 👋</h2>
          <p className="text-muted-foreground">
            Encontre sua próxima oportunidade de carreira
          </p>
        </div>

        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Vagas Disponíveis</CardTitle>
              <CardDescription>
                Explore oportunidades que combinam com seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver Vagas</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Complete seu perfil para aumentar suas chances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Editar Perfil</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Minhas Candidaturas</CardTitle>
              <CardDescription>
                Acompanhe o status das suas aplicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Ver Candidaturas</Button>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Estatísticas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Candidaturas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground">Em Análise</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-muted-foreground">Visualizações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

