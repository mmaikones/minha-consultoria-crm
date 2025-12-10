import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Messages from './pages/Messages';
import Protocols from './pages/Protocols';
import ProtocolEditor from './pages/ProtocolEditor';
import Notes from './pages/Notes';
import Marketing from './pages/Marketing';
import Financial from './pages/Financial';
import Gamification from './pages/Gamification';
import Settings from './pages/Settings';
import StudentProfileAdmin from './pages/StudentProfile';
import Library from './pages/Library';
import Reports from './pages/Reports';
import Templates from './pages/Templates';
import Schedule from './pages/Schedule';
import Campaigns from './pages/Campaigns';

// Student Portal
import StudentLayout from './layouts/StudentLayout';
import StudentHome from './pages/student/StudentHome';
import WorkoutView from './pages/student/WorkoutView';
import DietView from './pages/student/DietView';
import StudentProfile from './pages/student/StudentProfile';
import Notifications from './pages/student/Notifications';

import LoginStudent from './pages/auth/LoginStudent';
import LoginPro from './pages/auth/LoginPro';

import { AuthProvider } from './contexts/AuthContext';

import AnamnesePublic from './pages/AnamnesePublic';
import RewardsStore from './pages/student/RewardsStore';
import Plans from './pages/Plans';
import Checkout from './pages/Checkout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// Public Sales Pages
import PublicPlans from './pages/public/PublicPlans';
import AnamnesePublicForm from './pages/public/AnamnesePublicForm';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPro />} />
            <Route path="/login/aluno" element={<LoginStudent />} />
            <Route path="/anamnese" element={<AnamnesePublic />} />
            <Route path="/checkout/:planId" element={<Checkout />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />

            {/* Public Sales Routes */}
            <Route path="/vender/:professionalId" element={<PublicPlans />} />
            <Route path="/anamnese/:formLinkToken" element={<AnamnesePublicForm />} />

            {/* Admin/Professional Routes - NO AUTH for development */}
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="alunos" element={<Students />} />
              <Route path="student/:id" element={<StudentProfileAdmin />} />
              <Route path="mensagens" element={<Messages />} />
              <Route path="protocolos" element={<Protocols />} />
              <Route path="protocolos/:id" element={<ProtocolEditor />} />
              <Route path="anotacoes" element={<Notes />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="planos" element={<Plans />} />
              <Route path="campanhas" element={<Campaigns />} />
              <Route path="financeiro" element={<Financial />} />
              <Route path="gamificacao" element={<Gamification />} />
              <Route path="biblioteca" element={<Library />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="templates" element={<Templates />} />
              <Route path="agenda" element={<Schedule />} />
              <Route path="configuracoes" element={<Settings />} />
            </Route>

            {/* Legacy Routes - redirect to /admin */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/alunos" element={<Navigate to="/admin/alunos" replace />} />

            {/* Student Portal Routes - NO AUTH for development */}
            <Route path="/app" element={<StudentLayout />}>
              <Route index element={<StudentHome />} />
              <Route path="treino" element={<WorkoutView />} />
              <Route path="dieta" element={<DietView />} />
              <Route path="perfil" element={<StudentProfile />} />
              <Route path="rewards" element={<RewardsStore />} />
              <Route path="notificacoes" element={<Notifications />} />
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

