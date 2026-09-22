/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { StoreProvider, useStore } from './store';
import { LoginView } from './views/LoginView';
import { AdminDashboard } from './views/AdminDashboard';
import { DirectorDashboard } from './views/DirectorDashboard';
import { PedagogicalDashboard } from './views/PedagogicalDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';
import { SecretariatDashboard } from './views/SecretariatDashboard';
import { GovernanceDashboard } from './components/GovernanceDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Layout } from './components/Layout';

function AppContent() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <LoginView />;
  }

  const isGovernance = ['national', 'provincial', 'district'].includes(currentUser.role);

  return (
    <Layout>
      {currentUser.role === 'admin' && <AdminDashboard />}
      {currentUser.role === 'director' && <DirectorDashboard />}
      {currentUser.role === 'pedagogical' && <PedagogicalDashboard />}
      {currentUser.role === 'teacher' && <TeacherDashboard />}
      {currentUser.role === 'secretariat' && <SecretariatDashboard />}
      {isGovernance && <GovernanceDashboard />}
      {currentUser.role === 'student' && <StudentDashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

