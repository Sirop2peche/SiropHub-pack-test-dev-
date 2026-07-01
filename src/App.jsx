import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import {
  Explore, Tools, Converter, Communities,
  Auth, Upload, NotFound
} from './pages/Placeholders';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/explore"       element={<Explore />} />
          <Route path="/tools"         element={<Tools />} />
          <Route path="/tools/*"       element={<Tools />} />
          <Route path="/converter"     element={<Converter />} />
          <Route path="/communities"   element={<Communities />} />
          <Route path="/communities/*" element={<Communities />} />
          <Route path="/auth"          element={<Auth />} />
          <Route path="/upload"        element={<Upload />} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
