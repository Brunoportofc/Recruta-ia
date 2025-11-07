import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import Login from './pages/Login';
import LinkedInCallback from './pages/LinkedInCallback';
import FormularioCurriculo from './pages/FormularioCurriculo';
import TesteComportamental from './pages/TesteComportamental';
import AreaCandidato from './pages/AreaCandidato';
import MeuPerfil from './pages/MeuPerfil';
import MinhaCandidatura from './pages/MinhaCandidatura';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/formulario-curriculo"
            element={
              <ProtectedRoute>
                <FormularioCurriculo />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/teste-comportamental"
            element={
              <ProtectedRoute>
                <TesteComportamental />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/area-candidato"
            element={
              <ProtectedRoute>
                <AreaCandidato />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/meu-perfil"
            element={
              <ProtectedRoute>
                <MeuPerfil />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/minha-candidatura"
            element={
              <ProtectedRoute>
                <MinhaCandidatura />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redireciona raiz baseado na autenticação */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* 404 - Redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

