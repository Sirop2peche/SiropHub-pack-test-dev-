import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Explore from './pages/Explore';
import Upload from './pages/Upload';
import PackDetail from './pages/PackDetail';
import Profile from './pages/Profile';
import { CommunitiesPage, CommunityDetailPage } from './pages/Communities';
import Notifications from './pages/Notifications';
import { NotFound } from './pages/Placeholders';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/"                  element={<Home />} />
            <Route path="/auth"              element={<Auth />} />
            <Route path="/explore"           element={<Explore />} />
            <Route path="/upload"            element={<Upload />} />
            <Route path="/pack/:id"          element={<PackDetail />} />
            <Route path="/profile/:pseudo"   element={<Profile />} />
            <Route path="/communities"       element={<CommunitiesPage />} />
            <Route path="/community/:id"     element={<CommunityDetailPage />} />
            <Route path="/notifications"     element={<Notifications />} />
            <Route path="*"                  element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}
