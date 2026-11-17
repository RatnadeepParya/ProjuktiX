import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

import { HomePage } from './pages/Home.js';
import { ExplorePage } from './pages/Explore.js';
import { TechnologyDetailPage } from './pages/TechnologyDetail.js';
import { DocumentationReaderPage } from './pages/DocumentationReader.js';
import { ArchitectureExplorerPage } from './pages/ArchitectureExplorer.js';
import { AssessmentRunnerPage } from './pages/AssessmentRunner.js';
import { HandsOnLabPage } from './pages/HandsOnLab.js';
import { UserDashboardPage } from './pages/UserDashboard.js';
import { VerifyCertificatePage } from './pages/VerifyCertificate.js';
import { AdminPortalPage } from './pages/AdminPortal.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins cache
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="technologies/:slug" element={<TechnologyDetailPage />} />
                <Route path="documentation" element={<DocumentationReaderPage />} />
                <Route path="documentation/:techSlug" element={<DocumentationReaderPage />} />
                <Route path="architecture" element={<ArchitectureExplorerPage />} />
                <Route path="assessments" element={<AssessmentRunnerPage />} />
                <Route path="assessments/:examId" element={<AssessmentRunnerPage />} />
                <Route path="labs" element={<HandsOnLabPage />} />
                <Route path="labs/:techSlug" element={<HandsOnLabPage />} />
                <Route path="dashboard" element={<UserDashboardPage />} />
                <Route path="verify" element={<VerifyCertificatePage />} />
                <Route path="verify/:id" element={<VerifyCertificatePage />} />
                <Route path="admin" element={<AdminPortalPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
