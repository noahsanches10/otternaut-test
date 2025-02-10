import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { Tasks } from './pages/Tasks';
import { Help } from './pages/Help';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Campaigns } from './pages/Campaigns';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Integrations } from './pages/Integrations';
import { Customers } from './pages/Customers';
import { ResetPassword } from './pages/ResetPassword';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/"
          element={session ? <Navigate to="/home" replace /> : <Landing />}
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route 
          path="/auth" 
          element={session ? <Navigate to="/home" replace /> : <Auth />} 
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="home" element={<Home />} />
          <Route path="leads" element={<Leads />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;