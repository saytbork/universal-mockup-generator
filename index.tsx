import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import { AuthProvider } from './src/contexts/AuthContext';
import { FirebaseAuthGate } from './src/components/FirebaseAuthGate';
import UseCases from './UseCases';
import Comparisons from './Comparisons';
import BlogPage from './BlogPage';
import GuidesPage from './GuidesPage';
import FAQPage from './FAQPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/comparisons" element={<Comparisons />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route
            path="/app"
            element={
              <FirebaseAuthGate>
                <App />
              </FirebaseAuthGate>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
