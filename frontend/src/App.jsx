import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import PrivateRoute from './components/PrivateRoute';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectJoinPage from './pages/ProjectJoinPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/tasks" element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          } />
          <Route path="/projects" element={
            <PrivateRoute>
              <Dashboard activeTab="projects" />
            </PrivateRoute>
          } />
          {/* Project join route must come before the projectId route */}
          <Route path="/projects/join/:projectId" element={<ProjectJoinPage />} />
          <Route path="/projects/:projectId" element={
            <PrivateRoute>
              <ProjectDetailPage />
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <Dashboard activeTab="calendar" />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;