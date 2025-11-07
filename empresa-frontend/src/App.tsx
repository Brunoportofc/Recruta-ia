import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/Jobs/index";
import JobForm from "./pages/Jobs/JobForm";
import JobDetails from "./pages/Jobs/JobDetails";
import CandidatesList from "./pages/Candidates/index";
import AIAnalysis from "./pages/AI/index";
import Tests from "./pages/Tests";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vagas"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JobsList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vagas/nova"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JobForm />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vagas/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JobDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vagas/:id/editar"
        element={
          <ProtectedRoute>
            <AppLayout>
              <JobForm />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidaturas"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CandidatesList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ia"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIAnalysis />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/testes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Tests />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
